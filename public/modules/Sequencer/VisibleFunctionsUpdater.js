// =============================================
// Helper function for interpreting
// js-interpreter results and
// adding and removing nodes for D3.
// Used by the Sequencer.
// =============================================

import {last, pluck, cloneDeep, includes} from 'lodash';
import astTools from '../astTools/astTools.js';
import DeclarationTracker from '../astTools/DeclarationTracker.js';


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

function VisibleFunctionUpdater(resetNodes, resetLinks) {

  let nodes = resetNodes;
  let links = resetLinks;
  let state, prevState;
  let scopeChain = [];

  function action(interpreter, persistReturnedFunctions) {
    let doneAction = false;
    state = interpreter.stateStack[0];
    if (state && prevState) {
      doneAction = (addCalledFunctions(state, interpreter, persistReturnedFunctions) ||
        removeExitingFunctions(state, persistReturnedFunctions));
    }
    return doneAction;
  }


  function addCalledFunctions(state, interpreter, persistReturnedFunctions) {

    if (isSupportedFunctionCall(state)) {
      let callerNode = last(scopeChain) || null;
      let calleeName = state.node.callee.name || state.node.callee.id.name;
      let calleeNode = {
        // d3 fills up the rest of the object,
        // hence nesting for readability
        info: {
          name: calleeName,
          displayName: calleeName,
          callerNode: null,
          caller: callerNode,
          className: persistReturnedFunctions ? 'function-calling' : 'function-node',
        },
      };

      if (callerNode && calleeNode.info.name === callerNode.info.name) {
        // function has already been executed in higher scope - recursion
        calleeNode.info.displayName = calleeName + ' (r)';
      }

      nodes.push(calleeNode);
      let callLink = getCallLink(callerNode, calleeNode, 'link-calling');
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


  function removeExitingFunctions(state, persistReturnedFunctions) {

    if (isSupportedReturnToCaller(state)) {

      if (persistReturnedFunctions) {
        // change directions and class on returning functions
        let exitLink = last(links);
        exitLink.target.info.className = 'function-returning';
        let returnLink = getCallLink(
          exitLink.target, exitLink.source, 'link-returning');
        links.pop();
        links.unshift(returnLink);
      } else {
        links.splice(scopeChain.length - 1, Number.MAX_VALUE);
        nodes.splice(scopeChain.length, Number.MAX_VALUE);
      }
      scopeChain.pop();
      return true;
    }
    return false;
  }

  let linkIndex = 0;

  function getCallLink(source, target, className) {
    if (source && target) {
      let callLink = {
        source: source,
        target: target,
        className,
        index: linkIndex++,
      };
      return callLink;
    }
  }

  function getCodeSelectionNode() {
    return state.node;
  }

  function setPrevState() {
    if (state) {
      prevState = state;
    }
  }

  return {
    getCodeSelectionNode,
    nextStep: setPrevState,
      action,
  };
}

export default VisibleFunctionUpdater;
