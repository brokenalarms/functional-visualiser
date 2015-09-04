// =============================================
// Helper function for interpreting
// js-interpreter results and
// adding and removing nodes for D3.
// Controlled by the Sequencer.
// =============================================

import {last} from 'lodash';
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

function getInitialArgsArrays(state) {
  let displayArgs = [];
  if (state.node.arguments) {
    state.node.arguments.forEach((argument) => {
      // generated args are used for comparison when new computed
      // args become available, to decide whether the sequencer should pause
      // displayArgs.push(astTools.createCode(argument));
      // provide my own custom (shortened) names of arguments for d3
      // (ones generated from AST code are too verbose for the graph)
      displayArgs.push(formatOutput.astIdentifier(argument));
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
  let scopeChain = [];
  let enteringFunctionArgs = [];
  let end = {
    success: true,
    warning: false,
    failure: false,
  };
  let endStatus = 'success';

  function action(interpreter, persistReturnedFunctions) {
    let doneAction = false;
    state = interpreter.stateStack[0];
    if (state && prevState) {
      doneAction = (addCalledFunctions(state, interpreter, persistReturnedFunctions) ||
        updateEnteringFunctionArgs() ||
        removeExitingFunctions(state, interpreter, persistReturnedFunctions));
    }
    return doneAction;
  }

  function addCalledFunctions(state, interpreter, persistReturnedFunctions) {

    if (state.scope) {
      // we have finished gathering args for the function and
      // entered it: reset computed args
      enteringFunctionArgs = [];
    }

    if (state.doneCallee_ && !state.doneExec && state.n_) {
      // an argument has been calculated and fetched
      // for the outgoing function - add to the retrieveFunctionArgs
      // where it will later replace the displayed identifier and update.
      let argIndex = state.n_ - 1;
      enteringFunctionArgs[argIndex] = formatOutput.interpreterIdentifier(state.value);
    }

    if (isSupportedFunctionCall(state)) {
      let callerNode = last(scopeChain) || null;
      let calleeName = state.node.callee.name || state.node.callee.id.name;
      let displayArgs = getInitialArgsArrays(state);
      let status = (nodes.length === 0) ? 'root' : 'calling';
      let calleeNode = {
        // d3 fills up the rest of the object,
        // hence nesting for readability
        info: {
          name: calleeName,
          displayArgs,
          displayName: formatOutput.displayName(calleeName, displayArgs),
          callerNode: last(scopeChain) || null,
          caller: callerNode,
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
      scopeChain.push(calleeNode);
      return true;
    }
    return false;
  }

  function updateEnteringFunctionArgs() {

    // check whether enteringFunctionArgs has been updated with fetched values for identifiers:
    // where an enteringFunctionArg exists, tell the Sequencer to treat this as a display step.

    if (state.doneCallee_ && !state.doneExec &&
      state.node.arguments.length > 0) {
      let callerInfo = last(scopeChain).info;
      let paramUpdated = false;

      enteringFunctionArgs.forEach((arg, i) => {
        // this will skip over values in the sparse enteringFunctions array
        // if some callees have not returned yet
        if (arg !== callerInfo.displayArgs[i]) {
          callerInfo.displayArgs[i] = arg;
          paramUpdated = true;
        }
      });

      callerInfo.displayName = formatOutput.displayName(callerInfo.name, callerInfo.displayArgs);

      return (paramUpdated && enteringFunctionArgs.length === callerInfo.displayArgs.length);
    }
  }

  function removeExitingFunctions(state, interpreter, persistReturnedFunctions) {

    function isNotExitingRootNode(state, rootNode) {
      return !(state.node.type === 'FunctionExpression' &&
          state.node.callee.id.name === rootNode.info.name) &&
        !(state.node.type === 'CallExpression' &&
          state.node.callee.type === 'FunctionExpression' &&
          state.node.callee.id.name === rootNode.info.name);
    }

    if (isSupportedReturnToCaller(state) &&
      // don't want to exit the last node
      // (FunctionExpression used to run program in interpreter):
      // leave it on last success/failure animation
      isNotExitingRootNode(state, scopeChain[0])) {

      if (persistReturnedFunctions) {
        exitLink(last(links), interpreter.stateStack);
        exitNode(last(scopeChain));
      } else {
        links.splice(scopeChain.length - 1, Number.MAX_VALUE);
        nodes.splice(scopeChain.length, Number.MAX_VALUE);
      }
      scopeChain.pop();
      return true;
    }
    return false;
  }

  function exitLink(exitingLink, stateStack) {
    // change directions and class on returning functions
    // don't want to change links outgoing from the root node:
    // this prevents the last link incorrectly reversing again
    if (exitingLink.target.callerNode !== null) {
      let linkStatus;
      // explicit return of function
      if ((state.doneCallee_) &&
        (state.value.isPrimitive && state.value.data) || !state.value.isPrimitive) {
        linkStatus = 'returning';
        exitingLink.target.info.status = 'returning';
      } else {
        endStatus = 'failure';
        linkStatus = 'broken';
        exitingLink.target.info.status = 'failure';
        exitingLink.source.info.status = 'warning';
      }

      if (linkStatus !== 'broken') {
        // reverse source and target to flip arrows
        let returnLink = getCallLink(
          exitingLink.target, exitingLink.source, linkStatus);
        links.unshift(returnLink);
      }
      // break the chain for non-returned functions!
      links.pop();
    }
  }

  function exitNode(exitingNode) {
    // update parameters with data as it returns from callees
    let returnValue = formatOutput.interpreterIdentifier(state.value);
    exitingNode.info.displayName = `return (${returnValue})`;
  }

  let linkIndex = 0;

  function getCallLink(source, target, status) {
    if (source && target) {
      let callLink = {
        source: source,
        target: target,
        status,
        index: linkIndex++,
      };
      return callLink;
    }
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
