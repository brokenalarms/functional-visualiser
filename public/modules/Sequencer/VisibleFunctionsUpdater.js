// =============================================
// Helper function for interpreting
// js-interpreter results and
// adding and removing nodes for D3.
// Used by the Sequencer.
// =============================================

import {last} from 'lodash';

function isFunctionCall(state, prevState) {
  /* if the current state has scope, 
     the previous will have a function with args passed in*/
  return (state.scope && prevState.node &&
    prevState.node.type === 'CallExpression');
}

function isReturnToCaller(state, prevState) {
  return (state.node.type === 'CallExpression' &&
    // functions with returns, omitting those that call further functions
    ((prevState.node.type === 'ReturnStatement' &&
        !(prevState.node.argument.callee && !state.done)) ||
      // end of unassigned (non-return) FunctionExpression
      prevState.scope));
}

function VisibleFunctionUpdater(resetNodes, resetLinks) {

  let nodes = resetNodes;
  let links = resetLinks;
  let state, prevState;

  function action(stateStack) {
    let doneAction = false;
    state = stateStack[0];
    if (state && prevState) {
      doneAction = (addCalledFunctions(state) ||
        removeExitingFunctions(state, stateStack)
      );
    }
    return doneAction;
  }

  function addCalledFunctions(state) {
    if (isFunctionCall(state, prevState)) {
      let calleeName = prevState.node.callee.name || prevState.node.callee.id.name;

      // add extra info describing recursion
      if (nodes.length > 0) {
        let callerInfo = last(nodes).displayInfo;
        if (calleeName === callerInfo.calleeName) {
          calleeName = `${calleeName} (recursion ${++callerInfo.recursionCount})`;
        }
      }

      /* In JS, the parent scope for constructed functions is the global scope,
       even if they were constructed in some other scope. So I have to track
       my own 'parent' (callee) scope.*/
      let d3EnterNode = {
        displayInfo: {
          calleeName: calleeName,
          recursionCount: 0,
        },
      };
      addCallLink(d3EnterNode, last(nodes));
      nodes.push(d3EnterNode);
      /* Tracking by scope reference allows for recursion:
         since the interpreter generates new scopes for each function,
         (and is synchronous). 
         Doing via a scope -> d3Node map rather than pushing the scope directly
         in order to leave the original scopes untouched,
         as the JS-interpreter interferes with d3-added tick values. */
      return true;
    }
    return false;
  }

  function removeExitingFunctions(state, stateStack) {
    if (isReturnToCaller(state, prevState)) {
      links.pop();
      nodes.pop();
      return true;
    }
    return false;
  }

  function addCallLink(callee, caller) {
    if (caller && callee) {
      links.push({
        source: caller,
        target: callee,
      });
    }
  }

  function getCodeSelectionNode() {
    let codeSelectionNode = prevState.node;
    return codeSelectionNode;
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
