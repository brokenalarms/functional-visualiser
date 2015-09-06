// =============================================
// Helper function for interpreting
// js-interpreter results and
// adding and removing nodes for D3.
// Controlled by the Sequencer.
// =============================================

import {last} from 'lodash';
import DeclarationTracker from '../astTools/DeclarationTracker.js';
import formatOutput from '../d3DynamicVisualizer/formatOutput.js';
import astTools from '../astTools/astTools.js';
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

function getDisplayArgString(argument, currentScope) {
  let argString = '';
  if (argument.type === 'Literal') {
    return formatOutput.astIdentifier(argument);
  }
  let argumentIdentifier = astTools.getAstIdentifier(argument);
  if (currentScope && argumentIdentifier in currentScope.properties) {
    // function is passing through values declared in its parent scope;
    // populate with the values we've already been passed
    let parentIdentifier = currentScope.properties[argumentIdentifier];
    if (parentIdentifier.type === 'function') {
      // recursively run to append parameter functions and calculated args
      argString =
        formatOutput.interpreterIdentifier(parentIdentifier).concat(getDisplayArgs(parentIdentifier.node, currentScope).join(', '));
    } else {
      argString = formatOutput.interpreterIdentifier(parentIdentifier);
    }
  } else {
    // just generate from the code
    argString = formatOutput.astIdentifier(argument);
  }
  return argString;
}

function getDisplayArgs(node, currentScope) {
  let displayArgs = [];
  if (node.arguments) {
    node.arguments.forEach((argument, i) => {
      displayArgs[i] = getDisplayArgString(argument, currentScope);
    });
  }
  return displayArgs;
}
// ===============================================
// main action method
// ===============================================

function VisibleFunctionUpdater(resetNodes, resetLinks) {

  let nodes = resetNodes;
  let links = resetLinks;
  let state;
  let prevState;
  let nodeChain = [];
  let currentScope = {};
  let updatedFunctionArgs = [];
  // index of errorCount is equivalent to the endStatusArr diplayed
  let errorCount = 0;
  let endStatusArr = ['success', 'warning', 'failure'];
  // own index applied when creating links to track them
  let linkIndex = 0;

  function action(interpreter, persistReturnedFunctions) {
    let doneAction = false;
    state = interpreter.stateStack[0];
    if (state && prevState) {
      doneAction = (addCalledFunctions(state, interpreter, persistReturnedFunctions) ||
        removeExitingFunctions(state, interpreter, persistReturnedFunctions) ||
        updateEnteringFunctionArgs());
    }
    return doneAction;
  }

  function addCalledFunctions(state, interpreter, persistReturnedFunctions) {

    if (isSupportedFunctionCall(state)) {
      let calleeName = state.node.callee.name || state.node.callee.id.name;
      let callerNode = last(nodeChain) || null;
      let displayArgs = getDisplayArgs(state.node, currentScope);
      let status = (nodes.length === 0) ? 'root' : 'calling';
      let calleeNode = {
        // d3 fills up the rest of the object,
        // hence nesting for readability
        info: {
          name: calleeName,
          displayArgs,
          displayName: formatOutput.displayName(calleeName, displayArgs),
          callerNode,
          status,
        },
      };

      if (callerNode && calleeNode.info.name === callerNode.info.name) {
        // function has already been executed in higher scope - recursion
        calleeNode.info.displayName = '<i>(r)</i> ' + calleeNode.info.displayName;
      }

      nodes.push(calleeNode);
      let callLink = getCallLink(callerNode, calleeNode, 'calling');
      if (callLink) {
        links.push(callLink);
      }

      /* Tracking by scope reference allows for
      displaying nested functions and recursion */
      nodeChain.push(calleeNode);
      return true;
    }
    return false;
  }

  function removeExitingFunctions(state, interpreter, persistReturnedFunctions) {

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
      isNotExitingRootNode(state, nodeChain[0])) {

      if (persistReturnedFunctions) {
        exitLink(last(links), interpreter.stateStack);
        exitNode(last(nodeChain));
      } else {
        links.splice(nodeChain.length - 1, Number.MAX_VALUE);
        nodes.splice(nodeChain.length, Number.MAX_VALUE);
      }
      nodeChain.pop();
      return true;
    }
    return false;
  }

  function exitLink(exitingLink) {
    // change directions and class on returning functions
    // don't want to change links outgoing from the root node:
    // this prevents the last link incorrectly reversing again
    let linkStatus;
    // explicit return of function
    if ((state.doneCallee_) &&
      (state.value.isPrimitive && state.value.data !== undefined) ||
      !state.value.isPrimitive) {
      linkStatus = 'returning';
      exitingLink.target.info.status = 'returning';
    } else {
      errorCount++;
      linkStatus = 'broken';
      exitingLink.target.info.status = 'failure';
      exitingLink.source.info.status = 'warning';
    }

    if (linkStatus !== 'broken') {
      // reverse source and target to flip arrows and animation
      let returnLink = getCallLink(
        exitingLink.target, exitingLink.source, linkStatus);
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
  }


  function getCallLink(source, target, status) {
    if (source && target) {
      let callLink = {
        source: source,
        target: target,
        status,
        linkIndex: linkIndex++,
      };
      return callLink;
    }
  }

  function updateEnteringFunctionArgs() {
    // check whether updatedFunctionArgs has been updated with fetched values for identifiers:
    // ance all args have been updated, tell the Sequencer to treat this as a display step.

    if (state.scope) {
      // we have finished gathering args for the function and
      // entered it: reset computed args
      updatedFunctionArgs = [];
      currentScope = state.scope;
    }

    if (state.doneCallee_ && !state.doneExec) {
      if (state.n_) {
        // an argument has been calculated and fetched
        // for the outgoing function - add to the retrieveFunctionArgs
        // where it will later replace the displayed originalIdentifier and update.
        let argIndex = state.n_ - 1;
        let currentDisplayArg = last(nodeChain).info.displayArgs[argIndex];
        updatedFunctionArgs[argIndex] =
          formatOutput.interpreterIdentifier(state.value, currentDisplayArg);
      }

      let updateNode = last(nodeChain).info;
      let paramUpdated = false;
      if (updateNode.displayArgs.length &&
        updatedFunctionArgs.length === updateNode.displayArgs.length) {
        // we have updated all args and are ready to display

        updatedFunctionArgs.forEach((updateArg, i) => {
          let displayArg = updateNode.displayArgs[i];
          if (updateArg && updateArg !== displayArg) {
            updateNode.displayArgs[i] = updateArg;
            paramUpdated = true;
          }
        });

        updateNode.displayName = formatOutput.displayName(updateNode.name, updateNode.displayArgs);
        return paramUpdated;
      }
      return false;
    }
    return false;
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
    let rootNode = nodes[0];
    let endStatus = endStatusArr[Math.min(errorCount, 2)];
    rootNode.info.status = 'root-finished '.concat(endStatus);
  }

  return {
    nextStep: setPrevState,
    action,
    getRepresentedNode,
    finish,
  };
}

export default VisibleFunctionUpdater;
