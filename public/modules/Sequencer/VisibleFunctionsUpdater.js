// =============================================
// Helper function for interpreting
// js-interpreter results and
// adding and removing nodes for D3.
// Controlled by the Sequencer.
// =============================================

import {last, pluck, includes} from 'lodash';
import DeclarationTracker from '../astTools/DeclarationTracker.js';
import formatOutput from '../d3DynamicVisualizer/formatOutput.js';
// won't show stepping into and out of member methods (e.g array.slice)
// because these are builtins with blackboxed code.
// User functions may also be object properties, but I am not considering
// this for this exercise.
function isSupportedFunctionCall(state) {
  return (
    (state.node.type === 'CallExpression' && !state.doneCallee_) &&
    !(state.node.callee && state.node.callee.type === 'MemberExpression')
  );
}

function isSupportedReturnToCaller(state) {
  return (
    (state.node.type === 'CallExpression' && state.doneExec) &&
    !(state.node.callee && state.node.callee.type === 'MemberExpression')
  );
}

// ===============================================
// main action method
// ===============================================

function VisibleFunctionUpdater(resetNodes, resetLinks) {

  let nodes = resetNodes;
  let links = resetLinks;
  let state;
  let prevState;
  let scopeChain = [];
  let currentScope = {};
  let updatedDisplayArgs = [];
  // index of errorCount is equivalent to the endStatusArr diplayed
  let errorCount = 0;
  let endStatusArr = ['success', 'warning', 'failure'];
  // own index applied when creating links to track them
  let linkIndex = 0;
  // as we start to return nodes, we pop them off the array
  // and unshift them onto the front. The oldest returning nodes
  // that can be removed if the maxAllowedReturnNodes limit is exceeded are those
  // behind from the rootNodeIndex.
  let rootNodeIndex = 0;
  let recursion = false;
  let warning = null;
  // we don't want to give the same warning multiple times for multiple assignments to, say an
  let assignmentWarningVar = null;

  function action(interpreter, maxAllowedReturnNodes) {
    let doneAction = false;
    warning = null;
    state = interpreter.stateStack[0];
    if (state && prevState) {
      doneAction = (addCalledFunctions(state, interpreter) ||
        removeExitingFunctions(state, interpreter, maxAllowedReturnNodes) ||
        updateEnteringFunctionArgs());
    }
    return [doneAction, warning];
  }


  /**
   * [addCalledFunctions - checks to see if new nodes need to be added]
   * links have state: calling and returning
     nodes have type: root or normal
        nodes additionally have status: neutral, warning, failure or finished 
   */
  function addCalledFunctions(state, interpreter) {

    if (isSupportedFunctionCall(state)) {
      let calleeName = state.node.callee.name || state.node.callee.id.name;
      let callerNode = last(scopeChain) || null;
      let argumentIds = formatOutput.getArgIdentifiers(state.node);

      recursion = false;
      if (callerNode) {
        if (calleeName === callerNode.info.name) {
          // function has already been executed in higher scope - recursion
          // later used for formatting
          recursion = true;
        }
        if (callerNode.info.paramIds) {
          let callerParams = callerNode.info.paramIds;
          // we know the param identifier names for the function surrounding this call;
          // if there are any identifiers in arguments for the call expression
          // which match, then replace them with the values passed in from the parent
          argumentIds.forEach((arg, i) => {
            let callerParamIndex = callerParams.indexOf(arg);
            if (callerParamIndex > -1) {
              // replace the arg node with the node passed in from
              // the enclosing function
              argumentIds[i] = callerNode.info.argumentIds[callerParamIndex];
            }
          });
        }
      }
      let displayArgs = formatOutput.getDisplayArgs(state.node);

      let calleeNode = {
        // d3 fills up the rest of the object,
        // hence nesting for readability
        info: {
          name: calleeName,
          argumentIds,
          displayArgs,
          displayName: formatOutput.displayName(calleeName, displayArgs, recursion),
          callerNode,
          type: 'function',
          status: 'normal',
        },
      };
      if (nodes.length === 0) {
        calleeNode.info.type = 'root';
        calleeNode.info.status = 'neutral';
        calleeNode.info.errorCount = 0;
      }

      nodes.push(calleeNode);
      let callLink = getCallLink(callerNode, calleeNode, 'calling');
      if (callLink) {
        links.push(callLink);
      }

      /* Tracking by scope reference allows for
      displaying nested functions and recursion */
      scopeChain.push(calleeNode);
      return true;
    }
    return false;
  }

  function removeExitingFunctions(state, interpreter, maxAllowedReturnNodes) {

    function isNotExitingRootNode(state, rootNode) {
      // don't want to exit the last node
      // (FunctionExpression used to run program in interpreter):
      // leave it on last success/failure animation
      return !(state.node.type === 'FunctionExpression' &&
          state.node.callee.id.name === rootNode.info.name) &&
        !(state.node.type === 'CallExpression' &&
          state.node.callee.type === 'FunctionExpression' &&
          state.node.callee.id.name === rootNode.info.name);
    }

    if (isSupportedReturnToCaller(state) &&
      isNotExitingRootNode(state, scopeChain[0])) {

      let link = last(links) || null;
      if (link) {
        exitLink(link);
        exitNode(last(scopeChain));
      }
      // exiting the function; can allow a new warning again for same-named variable in higher scope
      assignmentWarningVar = null;

      if (rootNodeIndex > maxAllowedReturnNodes) {
        // the returned nodes shifted to the front of the array
        // has exceeded the limit; start removing the oldest
        // from the root node position backwards 
        removeOldestReturned(nodes, links, maxAllowedReturnNodes);
      }
      scopeChain.pop();
      return true;
    }
    return false;
  }

  function exitLink(exitingLink) {
    // change directions and class on returning functions
    // don't want to change links outgoing from the root node:
    // this prevents the last link incorrectly reversing again
    let linkIsBroken = false;
    // explicit return of function
    if ((state.doneCallee_) &&
      (state.value.isPrimitive && state.value.data !== undefined) ||
      !state.value.isPrimitive) {
      exitingLink.target.info.status = 'returning';
    } else {
      let rootNode = nodes[0];
      rootNode.info.errorCount = ++errorCount;
      linkIsBroken = true;
      exitingLink.target.info.status = 'failure';
      warning = {
        action: 'Principle: Referential transparency',
        message: 'Function does not return a value',
      };

      if (exitingLink.source !== rootNode) {
        exitingLink.source.info.status = 'warning';
      } else {
        // d3 handles the coloring of rootNode directly
        // in proportion to amount of errors -
        // let it take over
        rootNode.info.status = '';
      }
    }

    if (!linkIsBroken) {
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

    nodes.pop();
    nodes.unshift(exitingNode);
    rootNodeIndex++;
  }

  function removeOldestReturned(nodes, links, maxAllowedReturnNodes) {
    // cannot remove so many nodes that the root node onwards would be deleted
    // (ie onlf returning nodes shifted to the start of the array
    //  are eligible for deletion)
    //  this may not always be 1, since the user can adjust
    //  the maxAllowedReturnNodes on the fly
    let itemsToRemoveCount = rootNodeIndex - maxAllowedReturnNodes;
    let removalStartIndex = rootNodeIndex - itemsToRemoveCount;
    // links always have one less item than nodes
    // (root node has no calling link attached)
    // the indexes match on the way back,
    // except we don't want to try and remove
    // a link when there is only one node
    if (nodes.length > 1) {
      links.splice(removalStartIndex, itemsToRemoveCount);
    }
    nodes.splice(removalStartIndex, itemsToRemoveCount);
    rootNodeIndex -= itemsToRemoveCount;
  }


  function getCallLink(source, target, state) {
    if (source && target) {
      let callLink = {
        source: source,
        target: target,
        state,
        linkIndex: linkIndex++,
      };
      return callLink;
    }
  }


  function updateEnteringFunctionArgs() {
    let updateNode = scopeChain.length ? last(scopeChain).info : null;
    let updateNeeded = false;
    // check whether updatedDisplayArgs has been updated with fetched values for identifiers:
    // ance all args have been updated, tell the Sequencer to treat this as a display step.

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

    if (state.node.type === 'AssignmentExpression' &&
      state.doneLeft === true && state.doneRight === true) {
      let assignedExpression = state.node.left.name;
      if (!(includes(updateNode.variablesDeclaredInScope, assignedExpression))) {
        let callerNode = updateNode;
        let varPresentInScope = false;
        while (!(varPresentInScope = includes(callerNode.variablesDeclaredInScope, assignedExpression)) ||
          callerNode.callerNode !== null) {
          callerNode = callerNode.callerNode.info;
        }
        if (varPresentInScope) {
          updateNode.status = 'warning';
          callerNode.status = 'warning';
          warning = {
            action: 'Principle: Side effects',
            message: 'Function has mutated variable in another scope',
          };
        } else {
          updateNode.status = 'failure';
          warning = {
            'action': 'Principle: Side effects',
            'message': 'Function refers to an external variable that does not exist in the scope chain',
          };
        }
      } else {
        updateNode.status = 'notice';
        warning = {
          'action': 'Principle: Immutability',
          'message': 'Function has changed a variable in scope after creation',
        };
      }
      updateNeeded = (assignmentWarningVar !== assignedExpression);
      assignmentWarningVar = assignedExpression;
    }

    if (state.func_ && !state.func_.nativeFunc) {
      // get the identifier params so we can match with variables referring
      // to values declared in its callerNode scope when we hit the next function
      updateNode.paramIds = pluck(state.func_.node.params, 'name');
    }

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
      }

      // check that we have updated all args and are ready to display
      if (updateNode.displayArgs.length &&
        updatedDisplayArgs.length === updateNode.displayArgs.length) {
        updatedDisplayArgs.forEach((updateArg, i) => {
          let displayArg = updateNode.displayArgs[i];
          if (updateArg && updateArg !== displayArg) {
            updateNode.displayArgs[i] = updateArg;
            updateNeeded = true;
          }
        });

        updateNode.displayName = formatOutput.displayName(updateNode.name, updateNode.displayArgs, recursion);
      }
    }
    return updateNeeded;
  }

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

  function finish() {
    // no more actions, prep before final update
    let rootNode = nodes[nodes.length - 1];
    let endStatus = endStatusArr[Math.min(errorCount, 2)];
    rootNode.info.status = 'finished';
    rootNode.info.endStatus = endStatus;
  }

  return {
    nextStep: setPrevState,
    action,
    getRepresentedNode,
    finish,
  };
}

export default VisibleFunctionUpdater;
