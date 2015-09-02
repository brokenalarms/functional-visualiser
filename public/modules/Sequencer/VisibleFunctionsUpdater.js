// =============================================
// Helper function for interpreting
// js-interpreter results and
// adding and removing nodes for D3.
// Used by the Sequencer.
// =============================================

import {last, pluck, cloneDeep, includes} from 'lodash';
import astTools from '../astTools/astTools.js';
import DeclarationTracker from '../astTools/DeclarationTracker.js';

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

function VisibleFunctionUpdater(resetNodes, resetLinks) {

  let nodes = resetNodes;
  let links = resetLinks;
  let state, prevState;
  let scopeChain = [];
  let codeString;

  function action(interpreter, persistReturnedFunctions) {
    let doneAction = false;
    state = interpreter.stateStack[0];
    if (state && prevState) {
      doneAction = (addCalledFunctions(state, interpreter, persistReturnedFunctions) ||
        removeExitingFunctions(state, persistReturnedFunctions));
    }
    return doneAction;
  }

  function getArgsArray(state) {
    // provide my own custom (shortened) names of arguments for d3
    // (ones generated from AST code are too verbose for the graph)
    let argsArray = [];
    if (state.node.arguments) {
      state.node.arguments.forEach((argument, i) => {

        let argResultString = '';
        switch (argument.type) {
          case 'Literal':
            argResultString = argument.value;
            break;
          case 'Identifier':
            // question mark because identifier hasn't
            // been matched with object/function yet
            argResultString = `${argument.name}?`;
            break;
          case 'CallExpression':
            // put passed functions in italics
            argResultString = `<i>${argument.callee.name}</i>`;
            break;
          case 'MemberExpression':
          case 'BinaryExpression':
            // re-creating the code from the AST allows for display of nested objects
            // passed as references.
            argResultString = astTools.createCode(argument);
            break;
        }
        argsArray = argsArray.concat(argResultString);
      });
    }
    return argsArray;
  }

  let enteringFunctionArgs = [];


  function addCalledFunctions(state, interpreter, persistReturnedFunctions) {

    if (isSupportedFunctionCall(state)) {
      let callerNode = last(scopeChain) || null;
      let calleeName = state.node.callee.name || state.node.callee.id.name;
      let argsArray = getArgsArray(state);
      let calleeNode = {
        // d3 fills up the rest of the object,
        // hence nesting for readability
        info: {
          name: calleeName,
          argsArray,
          displayName: calleeName + '(' + argsArray.join(', ') + ')',
          callerNode: null,
          caller: callerNode,
          className: persistReturnedFunctions ? 'function-calling' : 'function-node',
        },
      };

      if (callerNode && calleeNode.info.name === callerNode.info.name) {
        // function has already been executed in higher scope - recursion
        calleeNode.info.displayName = '<i>(r)</i> ' + calleeNode.info.displayName;
      }

      nodes.push(calleeNode);
      let callLink = getCallLink(callerNode, calleeNode, 'link-calling');
      if (callLink) {
        links.push(callLink);
      }

      /* Tracking by scope reference allows for
      displaying nested functions and recursion */
      scopeChain.push(calleeNode);
      enteringFunctionArgs = [];
      return true;
    }
    return false;
  }

  function removeExitingFunctions(state, persistReturnedFunctions) {

    function exitLink() {
      // change directions and class on returning functions
      let exitingLink = last(links);
      exitingLink.target.info.className = 'function-returning';
      let returnLink = getCallLink(
        exitingLink.target, exitingLink.source, 'link-returning');
      links.pop();
      links.unshift(returnLink);
    }

    function exitNode() {
      let exitingNode = last(scopeChain);
      // update parameters with data as it returns from callees
      if (state.value.isPrimitive && state.value.data !== undefined) {
        exitingNode.info.displayName = `return (${state.value.data})`;
      } else {
        // function still returning objects,
        // give an update with information available
      }
    }

    if (isSupportedReturnToCaller(state)) {
      codeString = astTools.createCode(state.node);

      if (persistReturnedFunctions) {
        exitLink();
        exitNode();
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
