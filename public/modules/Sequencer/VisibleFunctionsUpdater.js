// =============================================
// Pre-processing for dynamic D3 visualization.
// Analyzes js-interpreter results to 
// infer adding and removing nodes
// for use by D3.
// Initiated by the Sequencer, and returns
// whether the Sequencer should consider the
// current state of the interpreter as constituting
// a display update step.
// =============================================

import {last, pluck, includes, equals} from 'lodash';
import formatOutput from '../d3DynamicVisualizer/formatOutput.js';
import warningConstants from './warningConstants.js';
import astTools from '../astTools/astTools.js';
import UpdateChecker from './UpdateChecker.js';
/**
 * VisibleFunctionsUpdater - runs three procedures: add, remove and update,
 * analgous to D3, via the action method.
 * Each has a main controlling function which returns true if a Sequencer update is required,
 *  and a number of helper functions which follow each
 */
function VisibleFunctionUpdater(resetNodes, resetLinks) {

  // these variables are all modified by the
  // add, remove and update helpers, though all variables
  // explicit to only the controllers for each of those 
  // are passed explicitly
  let nodes = resetNodes;
  let links = resetLinks;

  // use custom link index for d3 links and nodes, as otherwise they do not
  // reassociate reliably on popping off the end of the array and shifting
  // onto the front .
  let linkIndex = 0;
  // used to track current and previous interpreter state, 
  // to make inferencese about what is happening. Try to limit use
  // of prevState.
  let state;
  let prevState;

  // track the current depth of the scope chain
  // - by d3 node, not interpreter scope.
  let scopeChain = [];
  // this is the interpreter scope, which is sometimes used
  // for filling in missing primitive values and types if they
  // have been evaluated beyond their original AST node format.
  let currentScope = null;

  let currentEnclosingParams = null;

  // index of errorCount tracked here is passed to d3 for angry colours.
  let rootNode = null;

  // as we start to return nodes, we pop them off the array
  // and unshift them onto the front. The oldest returning nodes
  // that can be removed once the maxAllowedReturnNodes limit is exceeded
  // are therefore those immediately behind the rootNodeIndex.
  let rootNodeIndex = 0;

  let warning = null;

  // this is assigned if returning to a callExpression;
  // the next state is then checked to ensure that the
  // return result is assigned back to a variable.
  let exitingNode = null;

  let updateChecker = new UpdateChecker;


  // ===============================================
  // Main action method. Runs add, remove and update
  // checks and returns warnings and updates for display.
  // Will short-circuit other checks if one satisfies
  // condition - Sequencer can only show entering,
  // exiting or updating step for a single interpreter step/state.
  // ===============================================
  function action(interpreter, maxAllowedReturnNodes) {
    let doneAction = false;
    warning = null;
    state = interpreter.stateStack[0];
    if (state && prevState) {
      doneAction = (
        addEnteringFunction(state, interpreter) ||
        removeExitingFunction(state, interpreter, maxAllowedReturnNodes) ||
        updateEnteringFunction(state)
      );
    }
    return [doneAction, warning];
  }

  function getCallLink(source, target, linkState) {
    if (source && target) {
      let callLink = {
        source: source,
        target: target,
        linkState,
        linkIndex: linkIndex++,
      };
      return callLink;
    }
  }

  /**
   * [addEnteringFunction - checks to see if new nodes need to be added]
   * links have linkState: calling and returning
     nodes have type: root, normal or finished
     nodes additionally have status: neutral, notice, warning, failure or finished 
   */
  function addEnteringFunction(state, interpreter) {
    let updateNeeded = false;

    function isSupportedFunctionCall(state) {
      // won't show stepping into and out of member methods (e.g array.slice)
      // because these are builtins with blackboxed code.
      // User functions may also be object properties, but I am not considering
      // this for this exercise.
      return (
        (state.node.type === 'CallExpression' && !state.doneCallee_) &&
        !(state.node.callee && state.node.callee.type === 'MemberExpression')
      );
    }

    if (isSupportedFunctionCall(state)) {

      let calleeName = state.node.callee.name || state.node.callee.id.name;
      let callerNode = last(scopeChain) || null;

      let displayArgs = formatOutput.getDisplayArgs(state.node, true);
      let recursion = (callerNode && calleeName === callerNode.name);
      let displayName = formatOutput.displayName(calleeName, displayArgs, recursion);

      let calleeNode = {
        name: calleeName,
        interpreterArgTypes: [],
        displayArgs,
        updatedDisplayArgs: [],
        displayName,
        callerNode,
        // variablesDeclaredInScope is not populated until the interpreter generates scope
        variablesDeclaredInScope: null,
        warningsInScope: new Set(),
        type: 'function',
        status: 'normal',
      };

      // the root node carries through information to d3 about overall progress.
      if (nodes.length === 0) {
        calleeNode.type = 'root';
        calleeNode.errorCount = 0;
        calleeNode.status = 'success';
        rootNode = calleeNode;
      }

      // add nodes and links to D3
      nodes.push(calleeNode);
      let callLink = getCallLink(callerNode, calleeNode, 'calling');
      if (callLink) {
        links.push(callLink);
      }

      /* Tracking by scope reference allows for
      displaying nested functions and recursion */
      scopeChain.push(calleeNode);
      updateNeeded = true;
    }
    return updateNeeded;
  }

  // ===================
  // Exiting controller
  // ===================
  function removeExitingFunction(state, interpreter, maxAllowedReturnNodes) {
    let updateNeeded = false;

    if (isSupportedReturnToCaller(state)) {
      // we'll check on this on update cycle
      // next run to make sure its result is assigned to a variable 
      exitingNode = last(scopeChain);

      if (exitingNode !== rootNode) {
        let link = last(links) || null;
        if (link) {
          // don't want to come full circle and break links outgoing from root
          exitLink(link);
          exitNode(exitingNode);
          updateNeeded = true;
          scopeChain.pop();
        }
      } else {
        // we're at the root scope, there can't be a node exiting
        exitingNode = null;
      }

      if (rootNodeIndex > maxAllowedReturnNodes) {
        // the returned nodes shifted to the front of the array
        // has exceeded the limit; start removing the oldest
        // from the root node position backwards 
        removeOldestReturned(nodes, links, maxAllowedReturnNodes);
      }

    }
    return updateNeeded;
  }

  // =========================
  // Exiting helpers
  // =========================
  function isSupportedReturnToCaller(state) {
    return (
      (state.node.type === 'CallExpression' && state.doneExec) &&
      !(state.node.callee && state.node.callee.type === 'MemberExpression')
    );
  }

  function exitLink(exitingLink) {
    // change directions and class on returning functions
    // don't want to change links outgoing from the root node:
    // this prevents the last link incorrectly reversing again
    let nodeReturning = exitingLink.target;
    let functionSuccessfullyReturns = true;
    // explicit return of function
    if ((state.doneCallee_) &&
      (state.value.isPrimitive && state.value.data !== undefined) ||
      !state.value.isPrimitive) {
      if (nodeReturning.status === 'normal') {
        // leave returned functions in error state
        // if they generated warnings
        nodeReturning.status = 'returning';
      }
    } else {
      functionSuccessfullyReturns = false;
      nodeReturning.status = 'failure';
      warning = warningConstants.functionDoesNotReturnValue.get(nodeReturning.name);
      // don't add 50 errors for 50 mutations of a single array!
      if (!nodeReturning.warningsInScope.has(warning.message)) {
        rootNode.errorCount++;
      }
      nodeReturning.warningsInScope.add(warning.message);

      if (exitingLink.source !== rootNode) {
        exitingLink.source.status = 'warning';
      } else {
        // d3 handles the coloring of rootNode directly
        // in proportion to amount of errors -
        // let it take over now
        rootNode.status = '';
      }
    }

    if (functionSuccessfullyReturns) {
      // reverse source and target to flip arrows and animation
      let returnLink = getCallLink(
        exitingLink.target, exitingLink.source, 'returning');
      links.unshift(returnLink);
    }
    // break the chain for non-returned functions!
    links.pop();
  }

  function exitNode(exitingNode) {
    // update parameters with data as it returns from callees
    let index = (state.n_ !== undefined)? state.n_ : exitingNode.argIndex;
    let originalIdentifier = exitingNode.displayArgs[index];
    let returnValue = (state.value.isPrimitive) ? state.value.data : formatOutput.interpreterIdentifier(state.value, originalIdentifier);
    exitingNode.displayName = `return (${returnValue})`;
    exitingNode.updateText = true;

    // move exiting node to the front of the queue and increase the marker
    // - the oldest nodes that can be removed if maxAllowedNodes are exceeded
    // fall directly before the rootNodeIndex.
    nodes.pop();
    nodes.unshift(exitingNode);
    rootNodeIndex++;
  }

  function removeOldestReturned(nodes, links, maxAllowedReturnNodes) {
    // cannot remove so many nodes that the root node onwards would be deleted
    // (ie only returning nodes shifted to the start of the array
    //  are eligible for deletion)
    //  this may not always be simply 1, since the user can adjust
    //  the maxAllowedReturnNodes on the fly which could lead to
    //  many nodes needing removal on the next Sequencer step
    let itemsToRemoveCount = rootNodeIndex - maxAllowedReturnNodes;
    let removalStartIndex = rootNodeIndex - itemsToRemoveCount;
    // links always have one less item than nodes
    // (root node has no calling link attached)
    // the indexes match on the way back,
    // except we don't want to also try and remove
    // a link when there is only one node
    if (nodes.length > 1) {
      links.splice(removalStartIndex, itemsToRemoveCount);
    }
    nodes.splice(removalStartIndex, itemsToRemoveCount);
    rootNodeIndex -= itemsToRemoveCount;
  }

  // ===================================================
  // Update controller
  // update node parameters and provide warning messages
  // ===================================================
  function updateEnteringFunction(state) {
    // check whether updatedDisplayArgs has been updated with fetched values for identifiers:
    // ance all args have been updated, tell the Sequencer to treat this as a display step.

    let updateNode = (scopeChain.length) ? last(scopeChain) : null;
    getVariablesInScope(updateNode);
    updateParams(updateNode);

    if (updateNode) {
      // unlike action method, this should not short circuit
      // as the displayName may be updated as well
      // as warning messages generated.
      let a = isFunctionReturnUnassigned(updateNode);
      let b = isVariableModifiedOutOfScope(updateNode);
      let c = doesDisplayNameNeedUpdating(updateNode);
      return (a || b || c);
    }
  }

  // ==========================
  // Update helpers
  // ==========================
  function getVariablesInScope(updateNode) {
    if (state.scope) {
      currentScope = state.scope;
      // refresh list of variables declared in that scope,
      // Use these for seeing if variables out of function scope were mutated (side effects)
      if (updateNode) {
        updateNode.variablesDeclaredInScope = Object.keys(currentScope.properties);
      }
    }
  }

  function updateParams(updateNode) {
    if (state.func_ && !state.func_.nativeFunc) {
      // get the identifier paramNodes so we can match with variables referring
      // to values declared in its callerNode scope when we hit the next function
      // needs to be additionally tracked for matching up names,
      // since the param names we want to look up for 'return map(reduce(myFunc))'
      // are not going to be those of the direct parent node
      currentEnclosingParams = updateNode.paramNodes = state.func_.node.params;
    }
  }

  function nodeIsBeingAssigned(node) {
    return (node.type === 'ReturnStatement' ||
      node.type === 'VariableDeclarator' ||
      node.type === 'VariableDeclaration' ||
      node.type === 'BinaryExpression' ||
      node.type === 'AssignmentExpression'
    );
  }

  function nodeWillBeAssigned(state) {
    let node = state.node;
    let expressionAssigned = (node.type === 'ExpressionStatement' &&
      nodeIsBeingAssigned(node.expression));

    let callNotFinished = (node.type === 'CallExpression' && !state.doneExec);

    let argIndex = state.n_;
    let variableWillBeAssignedInScope = true;
    if (argIndex !== undefined) {
      variableWillBeAssignedInScope = (node.type === 'BlockStatement' &&
        (nodeIsBeingAssigned(node.body[argIndex - 1]) || nodeWillBeAssigned(node.body[argIndex - 1])));

      return (expressionAssigned || variableWillBeAssignedInScope || callNotFinished);
    }
    return expressionAssigned;
  }

  function isFunctionReturnUnassigned(updateNode) {
    let conditionMet = false;
    if (exitingNode) {
      // used to track an exit node to the next state, and ensure that
      // a returning funtion is being or will be (likely) assigned to a variable:
      // if the state progresses too far past the return then this potential error
      // just abandoned as it becomes increasingly unreliable to infer.
      if (!(nodeIsBeingAssigned(state.node) || nodeWillBeAssigned(state))) {
        // don't assign class to the rootNode,
        // it has it's own color scheme
        if (exitingNode.callerNode !== rootNode) {
          exitingNode.callerNode.status = 'warning';
        }
        // only create warning if a more critical one is not
        // already showing for that step
        if (!warning) {
          warning = warningConstants.functionReturnUnassigned.get(exitingNode.name);
          if (!exitingNode.warningsInScope.has(warning.message)) {
            rootNode.errorCount++;
          }
        }
        if (links[0] && links[0].source === exitingNode) {
          // break off this link too..but only if the returning link
          // (pointing back from target to source, and shifted back 
          // onto the front of the links array)
          // hasn't already been removed because the function didn't have a return statement
          links.shift();
        }
        exitingNode.warningsInScope.add(warning.message);
        conditionMet = true;
      }
      // there will likely be other conditions where the node is being unassigned,
      // but it is getting hard to infer now and so best to prevent the warning then
      // to show it as a false positive
      exitingNode = null;
    }
    return conditionMet;
  }

  function isVariableModifiedOutOfScope(updateNode) {
    let conditionMet = false;
    if (state.node.type === 'AssignmentExpression' &&
      (state.doneLeft === true && state.doneRight === true)) {
      let assignedExpression = (state.node.left.type !== 'MemberExpression') ?
        state.node.left.name : astTools.getEndMemberExpression(state.node.left);
      if (!(includes(updateNode.variablesDeclaredInScope, assignedExpression))) {
        let callerNode = updateNode;
        let varPresentInScope = false;
        while (callerNode.callerNode !== null && !varPresentInScope) {
          callerNode = callerNode.callerNode;
          varPresentInScope = includes(callerNode.variablesDeclaredInScope, assignedExpression);
        }
        if (varPresentInScope) {
          // highlight both the mutation node and the affected node
          updateNode.status = 'warning';
          if (callerNode !== rootNode) {
            callerNode.status = 'warning';
          }
          // cascade from previous:
          // only create warning if a more relavant one is not
          // already showing for that step
          warning = (!warning) ?
            warningConstants.variableMutatedOutOfScope.get(updateNode.name, callerNode.name) : warning;
          // don't add 50 errors for 50 mutations of a single array!
          if (!updateNode.warningsInScope.has(warning.message)) {
            rootNode.errorCount++;
          }
        } else {
          updateNode.status = 'failure';
          warning = (!warning) ?
            warningConstants.variableDoesNotExist.get(updateNode.name) : warning;
          // don't add 50 errors for 50 mutations of a single array!
          if (!updateNode.warningsInScope.has(warning.message)) {
            rootNode.errorCount++;
          }
        }
      } else {
        // don't count variables mutated in scope as errors,
        // just give a notice
        // since it's more a 'use when appropriate' rule,
        // especially with JavaScript
        updateNode.status = 'notice';
        warning = (!warning) ?
          warningConstants.variableMutatedInScope.get(updateNode.name) : warning;
      }
      conditionMet = !(updateNode.warningsInScope.has(warning.message));
      updateNode.warningsInScope.add(warning.message);
      return conditionMet;
    }
  }

  function matchRemainingIdentifiersWithArgs(updateNode, node) {

    let args = formatOutput.getArguments(node);
    let newArgs = [];
    let interpreterArgTypes = [];
    // ========================================
    // the worst function in this program.    
    // ========================================
    args.forEach((arg, i) => {
      // don't write over the interpreter results we have already
      if (updateNode.updatedDisplayArgs[i] === undefined) {
        let matchIdentifier = astTools.getId(arg);

        // get the type for formatting purposes
        // don't overwrite if already there because
        // this may be the recursing version and change 'function'
        // to 'string' for a parameter passed in
        if (matchIdentifier in currentScope.properties &&
          updateNode.interpreterArgTypes[i] === undefined) {
          updateNode.interpreterArgTypes[i] = currentScope.properties[matchIdentifier].type;
        }

        if (arg.type === 'Literal') {
          newArgs[i] = matchIdentifier;
          if (updateNode.interpreterArgTypes[i] === undefined) {
            updateNode.interpreterArgTypes[i] = (isNaN(arg.value)) ?
              'string' : 'number';
          }
        } else if (arg.type === 'Identifier' && !updateNode.callerNode.callerNode) {
          newArgs[i] = matchIdentifier;
        } else if (matchIdentifier in currentScope.properties &&
          currentScope.properties[matchIdentifier].isPrimitive) {
          // gets conditions like var i = 20 = length = Array(length);
          newArgs[i] = currentScope.properties[matchIdentifier].data;
        } else if (arg.arguments) {
          updateNode.interpreterArgTypes[i] = 'function';
          // recursively add arguments for functions passed as arguments
          newArgs[i] = matchIdentifier + ' (' + matchRemainingIdentifiersWithArgs(updateNode, arg).join(', ') + ')';
        } else if (updateNode.callerNode) {
          // if we're in the root scope, there's no params (for this exercise)
          // must need to match param names to arguments passed in from enclosing function
          // - may be more than one level up due to nested functions in parameters
          let enclosingParamsParent = updateNode.callerNode;
          while (!enclosingParamsParent.paramNodes) {
            enclosingParamsParent = enclosingParamsParent.callerNode;
          }
          let enclosingParamNames = pluck(enclosingParamsParent.paramNodes, 'name') || [];
          let matchedParamIndex = enclosingParamNames.indexOf(matchIdentifier);
          if (matchedParamIndex > -1) {
            let parentArgumentsPassed = enclosingParamsParent.displayArgs;
            newArgs[i] = parentArgumentsPassed[matchedParamIndex];
            updateNode.interpreterArgTypes[i] = enclosingParamsParent.interpreterArgTypes[matchedParamIndex];
          } else {
            // backup - this covers things like anonymous functions
            newArgs[i] = updateNode.displayArgs[i];
            updateNode.interpreterArgTypes[i] = 'direct';
          }
        } else {
          console.error('should have matched something...');
        }
      } else {
        newArgs[i] = updateNode.updatedDisplayArgs[i];
      }
    });
    return newArgs;
  }

  function doesDisplayNameNeedUpdating(updateNode) {
    let conditionMet = false;

    function argsHaveChangedValue(initArgs, updateArgs) {
      // check for gaps in sparse array or some updateArgs missing.
      // Not ready to display until all arguments are available (if there are any at all)
      if (!(initArgs.length > 0)) {
        return false;
      }
      for (let i = 0, length = initArgs.length; i < length; i++) {
        if (initArgs[i] !== updateArgs[i]) {
          return true;
        }
        if (i === length - 1) {
          return false;
        }
      }
    }

    if (state.doneCallee_) {
      if (!state.doneExec) {

        if (state.n_) {
          // an argument has been calculated and fetched:
          // if it is primitive, show it, otherwise keep the
          // passed through argument/param identifiers
          // - need to keep this to get provided interpreter
          // expressions, eg 9 from 10 --> (n-10)
          let argIndex = updateNode.argIndex = (state.n_ - 1);
          if (state.value.isPrimitive) {
            // interpreter already has reference - show it directly
            updateNode.updatedDisplayArgs[argIndex] = state.value.data.toString();
          }
          updateNode.interpreterArgTypes[argIndex] = state.value.type;
        }

        // if the interpreter is pre-processing arguments, check they're all fetched
        if (updateNode.argIndex === (updateNode.displayArgs.length - 1) ||
          // if not, we get everything
          updateNode.argIndex === undefined && state.value) {

          // need to fill in the gap now between params and arguments        
          updateNode.updatedDisplayArgs = matchRemainingIdentifiersWithArgs(updateNode, state.node);

          if (argsHaveChangedValue(updateNode.displayArgs, updateNode.updatedDisplayArgs)) {
            updateNode.displayArgs = updateNode.updatedDisplayArgs;
            updateNode.updatedDisplayArgs = [];
            updateNode.argIndex = -1;
            conditionMet = true;
          }
        }
      }

      if (conditionMet) {
        updateNode.updateText = true;
        // formatted display args are not kept - need original identifiers
        // for comparison or even more of a mess....learnt this the first time!
        let formattedDisplayArgs = updateNode.displayArgs.map((arg, i) => {
          return formatOutput.interpreterIdentifier({
            type: updateNode.interpreterArgTypes[i],
          }, updateNode.displayArgs[i]);
        });

        let recursion = (updateNode.callerNode && updateNode.name === updateNode.callerNode.name);
        updateNode.displayName = formatOutput.displayName(updateNode.name, formattedDisplayArgs, recursion);
      }
    }
    return conditionMet;
  }

  // ====================================
  // Functions used by Sequencer to setup
  // the VisibleFunctionsUpdater for its
  // next run, 
  // before and after it displays a step 
  // ====================================

  function getRepresentedNode() {
    if (prevState.node.type === 'ReturnStatement') {
      return prevState.node;
    }
    return state.node;
  }

  function setPrevState() {
    if (state) {
      prevState = state;
    }
  }

  function setFinished() {
    // set final action state for animation
    rootNode.status = 'finished';
  }

  return {
    nextStep: setPrevState,
    action,
    getRepresentedNode,
    setFinished,
  };
}

export default VisibleFunctionUpdater;
