// =============================================
// Helper function for interpreting
// js-interpreter results and
// adding and removing nodes for D3.
// Used by the Sequencer.
// =============================================

import {last, isEqual} from 'lodash';
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

function getInitialArgsArrays(state) {
  let displayArgs = [];
  if (state.node.arguments) {
    state.node.arguments.forEach((argument) => {
      // generated args are used for comparison when new computed
      // args become available, to decide whether the sequencer should pause
      // displayArgs.push(astTools.createCode(argument));
      // provide my own custom (shortened) names of arguments for d3
      // (ones generated from AST code are too verbose for the graph)
      displayArgs.push(formatAstIdentifier(argument));
    });
  }
  return displayArgs;
}

function formatAstIdentifier(argument) {

  function formatFunctionName(nameLoc, paramsLoc) {
    // don't show the body of the function, for brevity
    let funcString = (nameLoc) ?
      `<i>${nameLoc}</i> ` :
      `<i>anonymous</i> `;
    if (paramsLoc.length > 0) {
      let paramArray = [];
      paramsLoc.forEach((param) => {
        paramArray.push(formatAstIdentifier(param));
      });
      funcString = funcString.concat('(' + paramArray.join(', ') + ')');
    }
    return funcString;
  }

  let argResultString = '';
  let nameLoc;
  switch (argument.type) {
    case 'Literal':
      argResultString = isNaN(argument.value) ?
        `'${argument.value}'` : argument.value.toString();
      break;
    case 'Identifier':
      // question mark because identifier hasn't
      // been matched with object/function yet
      argResultString = `${argument.name}?`;
      break;
    case 'CallExpression':
      // put passed functions in italics
      argResultString = formatFunctionName(argument.callee.name, argument.arguments); //`<i>${argument.callee.name}</i>`;
      break;
    case 'FunctionDeclaration':
      argResultString = formatFunctionName(argument.id.name, argument.params);
      break;
    case 'FunctionExpression':
      argResultString = formatFunctionName(argument.id, argument.params);
      break;
    case 'MemberExpression':
    case 'BinaryExpression':
      // re-creating the code from the AST allows for display of nested objects
      // passed as references.
      argResultString = astTools.createCode(argument);
      break;
  }
  return argResultString;
}

function formatInterpreterIdentifier(value) {
  let resultStr = '';
  switch (value.type) {
    case 'number':
      resultStr = value.data.toString();
      break;
    case 'string':
      resultStr = `'${value.data}'`;
      break;
    case 'object':
      resultStr = '{object}';
      break;
    case 'function':
      resultStr = formatAstIdentifier(value.node);
      break;
    default:
      console.error('unknown parameter value type encountered: ' + value.type);
  }
  return resultStr;
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

  function action(interpreter, persistReturnedFunctions) {
    let doneAction = false;
    state = interpreter.stateStack[0];
    if (state && prevState) {
      doneAction = (addCalledFunctions(state, interpreter, persistReturnedFunctions) ||
        updateEnteringFunctionArgs() ||
        removeExitingFunctions(state, persistReturnedFunctions));
    }
    return doneAction;
  }

  function addCalledFunctions(state, interpreter, persistReturnedFunctions) {

    if (state.scope) {
      // we have finished gathering args for the function and
      // entered it: reset computed args
      enteringFunctionArgs = [];
    }

    if (prevState.node.type !== 'ReturnStatement' &&
      state.doneCallee_ && state.n_) {
      // an argument has been calculated and fetched
      // for the outgoing function - add to the retrieveFunctionArgs
      // where it will later replace the displayed identifier and update.
      let argIndex = state.n_ - 1;
      enteringFunctionArgs[argIndex] = formatInterpreterIdentifier(state.value);
    }

    if (isSupportedFunctionCall(state)) {
      let callerNode = last(scopeChain) || null;
      let calleeName = state.node.callee.name || state.node.callee.id.name;
      let displayArgs = getInitialArgsArrays(state);
      let className = (nodes.length === 0) ? 'root-function' : 'function-calling';
      let calleeNode = {
        // d3 fills up the rest of the object,
        // hence nesting for readability
        info: {
          name: calleeName,
          displayArgs,
          displayName: calleeName + '(' + displayArgs.join(', ') + ')',
          callerNode: last(scopeChain) || null,
          caller: callerNode,
          className: persistReturnedFunctions ? className : 'function-node',
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
    if (prevState.node.type !== 'ReturnStatement' &&
      state.doneCallee_ && state.node.arguments.length > 0) {
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

      callerInfo.displayName = callerInfo.name + '(' + callerInfo.displayArgs.join(', ') + ')';

      return (paramUpdated && enteringFunctionArgs.length === callerInfo.displayArgs.length);
    }
  }

  function removeExitingFunctions(state, persistReturnedFunctions) {

    function exitLink() {
      // change directions and class on returning functions
      let exitingLink = last(links);
      // don't want to change links outgoing from the root node:
      // this prevents the last link incorrectly reversing again
      if (exitingLink.target.callerNode !== null) {
        let linkState;
        if (prevState.node.type === 'ReturnStatement') {
          exitingLink.target.info.className = 'function-returning';
          linkState = 'returning';
        } else {
          exitingLink.target.info.className = 'function-returning';
          linkState = 'broken';
        }
        let returnLink = getCallLink(
          exitingLink.target, exitingLink.source, linkState);
        links.pop();
        links.unshift(returnLink);
      }
    }

    function exitNode() {
      let exitingNode = last(scopeChain);
      // update parameters with data as it returns from callees
      if (state.value.isPrimitive) {
        if (state.value.data !== undefined) {
          let returnValue = isNaN(state.value.data) ? `'${state.value.data}'` : state.value.data;
          exitingNode.info.displayName = `return (${returnValue})`;
        }
      } else if (state.value.node && state.value.node.type === 'FunctionExpression') {
        // function still returning objects,
        // give an update with information available
        let returnString = (state.value.node.id) ?
          state.value.node.id + ' (' : 'function (';
        if (state.value.node.params) {
          state.value.node.params.forEach((param) => {
            returnString = returnString.concat(astTools.createCode(param));
          });
        }
        exitingNode.info.displayName = returnString + ')';
      }
    }

    if (isSupportedReturnToCaller(state) &&
      // don't want to exit the last node (FunctionExpression to run program)
      // as the links have now come full circle and this would incorrectly
      //  flip the direction of the next associated link
      !(state.node.type === 'FunctionExpression' &&
        state.node.callee.id.name === scopeChain[0].info.name) &&
      !(state.node.type === 'CallExpression' &&
        state.node.callee.type === 'FunctionExpression' &&
        state.node.callee.id.name === scopeChain[0].info.name)) {

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

  function getCallLink(source, target, linkState) {
    if (source && target) {
      let callLink = {
        source: source,
        target: target,
        linkState,
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
    nodes[0].info.className = 'root-finished success opaque';
  }

  return {
    nextStep: setPrevState,
    action,
    getRepresentedNode,
    finish,
  };
}

export default VisibleFunctionUpdater;
