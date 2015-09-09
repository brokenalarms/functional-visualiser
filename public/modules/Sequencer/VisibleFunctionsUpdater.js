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

import {last, pluck, includes} from 'lodash';
import formatOutput from '../d3DynamicVisualizer/formatOutput.js';
import warningConstants from './warningConstants.js';
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
  let state;
  let prevState;
  let scopeChain = [];
  let currentScope = {};
  let updatedDisplayArgs = [];
  // index of errorCount tracked here is passed to d3 for angry colours.
  let rootNode = null;
  // use custom link index for d3 links and nodes, as otherwise they do not
  // reassociate reliably on popping off the end of the array and shifting
  // onto the front 
  let linkIndex = 0;
  // as we start to return nodes, we pop them off the array
  // and unshift them onto the front. The oldest returning nodes
  // that can be removed once the maxAllowedReturnNodes limit is exceeded
  // are therefore those immediately behind the rootNodeIndex.
  let rootNodeIndex = 0;
  let recursion = false;

  let warning = null;
  // this is assigned if returning to a callExpression;
  // the next state is then checked to ensure that the
  // return result is assigned back to a variable.
  let exitingNode = null;


  // ===============================================
  // Main action method. Runs add, remove and update
  // checks and returns warnings and updates for display.
  // Will short-circuits other checks if one satisfies
  // condition - interpreter can only be entering,
  // exiting or updating.
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
      let argumentIds = formatOutput.getArgIdentifiers(state.node);
      recursion = false;

      if (callerNode) {
        if (calleeName === callerNode.info.name) {
          // function has already been executed in higher scope - recursion
          // later used for '<i>r</i>' formatting
          recursion = true;
        }
        if (callerNode.info.paramIds) {
          // we know the param identifier names for the function surrounding this call;
          // if there are any identifiers in arguments for the call expression
          // now in consideration which match, replace them with the identifiers
          // or primitives passed in from the caller arguments
          let callerParams = callerNode.info.paramIds;
          argumentIds.forEach((arg, i) => {
            let callerParamIndex = callerParams.indexOf(arg);
            if (callerParamIndex > -1) {
              // replace the arg identifier with the identifier passed in from
              // the enclosing function
              argumentIds[i] = callerNode.info.argumentIds[callerParamIndex];
            }
          });
        }
      }
      let displayArgs = formatOutput.getDisplayArgs(state.node);

      let calleeNode = {
        // d3 fills up the root of the object with properties,
        // hence nesting under 'info' for separation and readability in dev tools.
        info: {
          name: calleeName,
          argumentIds,
          displayArgs,
          displayName: formatOutput.displayName(calleeName, displayArgs, recursion),
          callerNode,
          // variablesDeclaredInScope is not populated until the interpreter generates scope
          variablesDeclaredInScope: null,
          warningsInScope: new Set(),
          type: 'function',
          status: 'normal',
        },
      };

      // the root node carries through information to d3 about overall progress.
      if (nodes.length === 0) {
        calleeNode.info.type = 'root';
        calleeNode.info.errorCount = 0;
        calleeNode.info.status = 'success';
        rootNode = calleeNode;
      }

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
      exitingNode = last(scopeChain);
      if (exitingNode !== rootNode) {
        let link = last(links) || null;
        if (link) {
          exitLink(link);
          // we'll check on this on update cycle
          // next run to make sure its result is assigned to a variable 
          exitNode(exitingNode);
        }

        if (rootNodeIndex > maxAllowedReturnNodes) {
          // the returned nodes shifted to the front of the array
          // has exceeded the limit; start removing the oldest
          // from the root node position backwards 
          removeOldestReturned(nodes, links, maxAllowedReturnNodes);
        }
        scopeChain.pop();
        updateNeeded = true;
      } else {
        // no more actions, prep before final update animation
        exitingNode = null;
        rootNode.info.status = 'finished';
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
    let nodeReturning = exitingLink.target.info;
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
      warning = warningConstants.functionDoesNotReturnValue;
      // don't add 50 errors for 50 mutations of a single array!
      if (!nodeReturning.warningsInScope.has(warning)) {
        // treating no returns as twice as worse
        // easiest way to infer there are side effects
        rootNode.info.errorCount += 2;
      }
      nodeReturning.warningsInScope.add(warning);

      if (exitingLink.sourceS !== rootNode) {
        exitingLink.source.info.status = 'warning';
      } else {
        // d3 handles the coloring of rootNode directly
        // in proportion to amount of errors -
        // let it take over now
        rootNode.info.status = '';
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
    let originalIdentifier = exitingNode.info.displayArgs[state.n_ - 1];
    let returnValue = formatOutput.interpreterIdentifier(state.value, originalIdentifier);
    exitingNode.info.displayName = `return (${returnValue})`;
    exitingNode.info.updateText = true;

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

    let updateNode = (scopeChain.length) ? last(scopeChain).info : null;
    getVariablesInScope(updateNode);
    updateParamsIdsFromCaller(updateNode);

    if (updateNode) {
      // unlike action, this should not short circuit
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
      // we have finished gathering args for the function and
      // entered it: reset computed args
      updatedDisplayArgs = [];
      currentScope = state.scope;
      // refresh list of variables declared in that scope,
      // Use these for seeing if variables out of function scope were mutated (side effects)
      if (updateNode) {
        updateNode.variablesDeclaredInScope = Object.keys(currentScope.properties);
      }
    }
  }

  function updateParamsIdsFromCaller(updateNode) {
    if (state.func_ && !state.func_.nativeFunc) {
      // get the identifier params so we can match with variables referring
      // to values declared in its callerNode scope when we hit the next function
      updateNode.paramIds = pluck(state.func_.node.params, 'name');
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

  function nodeWillBeAssigned(node, argIndex) {
    let expressionAssigned = (node.type === 'ExpressionStatement' &&
      nodeIsBeingAssigned(node.expression));

    if (argIndex) {
      let variableWillBeAssignedInScope = (node.type === 'BlockStatement' &&
        (nodeIsBeingAssigned(node.body[argIndex - 1]) || nodeWillBeAssigned(node.body[argIndex - 1])));
      return (expressionAssigned || variableWillBeAssignedInScope);
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
      if (!(nodeIsBeingAssigned(state.node) || nodeWillBeAssigned(state.node, state.n_))) {

        exitingNode.info.callerNode.info.status = 'warning';
        rootNode.info.errorCount++;
        // only create warning if a more critical one is not
        // already showing for that step
        if (!warning) {
          warning = warningConstants.functionReturnUnassigned;
        }
        if (links[0].source === exitingNode) {
          // break off this link too..but only if the returning link
          // (pointing back from target to source, and shifted back 
          // onto the front of the links array)
          // hasn't already been removed because the function didn't have a return statement
          links.shift();
        }
        exitingNode.info.warningsInScope.add(warning);
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
      (state.doneLeft === state.doneRight === true)) {
      let assignedExpression = state.node.left.name;
      if (!(includes(updateNode.variablesDeclaredInScope, assignedExpression))) {
        let callerNode = updateNode;
        let varPresentInScope = false;
        while (callerNode.callerNode !== null && !varPresentInScope) {
          callerNode = callerNode.callerNode.info;
          varPresentInScope = includes(callerNode.variablesDeclaredInScope, assignedExpression);
        }
        if (varPresentInScope) {
          // highlight both the mutation node and the affected node
          updateNode.status = callerNode.status = 'warning';
          // cascade from previous:
          // only create warning if a more relavant one is not
          // already showing for that step
          warning = (!warning) ?
            warningConstants.variableMutatedOutOfScope : warning;
          // don't add 50 errors for 50 mutations of a single array!
          if (!updateNode.warningsInScope.has(warning)) {
            rootNode.info.errorCount++;
          }
        } else {
          updateNode.status = 'failure';
          warning = (!warning) ?
            warningConstants.variableDoesNotExist : warning;
          // don't add 50 errors for 50 mutations of a single array!
          if (!updateNode.warningsInScope.has(warning)) {
            rootNode.info.errorCount++;
          }
        }
      } else {
        // don't count these as errors, since it's the least
        // 'enforceable' rule in theory
        updateNode.status = 'notice';
        warning = (!warning) ?
          warningConstants.variableMutatedInScope : warning;
      }
      conditionMet = !(updateNode.warningsInScope.has(warning));
      updateNode.warningsInScope.add(warning);
      return conditionMet;
    }
  }

  function doesDisplayNameNeedUpdating(updateNode) {
    let conditionMet = false;
    if (state.doneCallee_ && !state.doneExec) {
      // pre-calculation of call arguments passed to the callee
      // these will overwrite the args passed based on the paramIds
      if (state.n_) {
        // an argument has been calculated and fetched
        // for the outgoing function - add to the retrieveFunctionArgs
        // where it will later replace the displayed originalIdentifier and update.
        let argIndex = state.n_ - 1;
        let identifier = updateNode.argumentIds[argIndex];
        updatedDisplayArgs[argIndex] = formatOutput.interpreterIdentifier(state.value, identifier);

        if (state.value.isPrimitive) {
          // interpreter already has reference - show it directly
          updatedDisplayArgs[argIndex] = formatOutput.interpreterIdentifier(state.value);
        } else {
          updatedDisplayArgs[argIndex] = formatOutput.interpreterIdentifier(state.value, identifier);
        }
      } else {
        // try to match any remaining identifiers
        // currently written as 'paramId?' with the
        // argument identifiers passed in
        /*        updateNode.argumentIds.forEach((arg, i) => {
                  if (!updatedDisplayArgs[i]) {
                    updatedDisplayArgs[i] = arg;
                  }
                });*/
      }

      // check that we have updated all args and are ready to display
      if (updateNode.displayArgs.length &&
        updatedDisplayArgs.length === updateNode.displayArgs.length) {
        updatedDisplayArgs.forEach((updateArg, i) => {
          let displayArg = updateNode.displayArgs[i];
          if (updateArg && updateArg !== displayArg) {
            updateNode.displayArgs[i] = updateArg;
            updateNode.updateText = true;
            conditionMet = true;
          }
        });
        updateNode.displayName = formatOutput.displayName(updateNode.name, updateNode.displayArgs, recursion);
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

  return {
    nextStep: setPrevState,
    action,
    getRepresentedNode,
  };
}

export default VisibleFunctionUpdater;
