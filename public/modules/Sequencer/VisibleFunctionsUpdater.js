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

  switch (argument.type) {
    case 'Literal':
      return isNaN(argument.value) ?
        `"${argument.value}"` : argument.value.toString();
    case 'Identifier':
      // question mark because identifier hasn't
      // been matched with object/function yet
      return `${argument.name}?`;
    case 'CallExpression':
      // put passed functions in italics
      return formatFunctionName(argument.callee.name, argument.arguments);
    case 'FunctionDeclaration':
      return formatFunctionName(argument.id.name, argument.params);
    case 'FunctionExpression':
      return formatFunctionName(argument.id, argument.params);
    case 'MemberExpression':
    case 'BinaryExpression':
      // re-creating the code from the AST allows for display of nested objects
      // passed as references.
      return astTools.createCode(argument);
    default:
      console.error('unrecognised astType for formatting');
  }
}

function formatInterpreterIdentifier(value) {
  switch (value.type) {
    case 'undefined':
      return value.type;
    case 'number':
      return value.data.toString();
    case 'string':
      return `'${value.data}'`;
    case 'object':
      return '{object}';
    case 'function':
      return formatAstIdentifier(value.node);
    default:
      console.error('unknown parameter value type encountered: ' + value.type);
  }
}

function formatDisplayName(name, args) {
  let displayArgs = args;
  if (args.length > 1) {
    displayArgs = args.map((arg, i) => {
      let firstChar = arg.substring(1);
      if (isNaN(firstChar) && firstChar !== `'` && firstChar !== `{`) {
        if (i === 0) {
          return `<div>${name} (${arg}</div>`;
        }
        if (i < args.length - 1) {
          return `<div class="text-indent">${arg}</div>`;
        }
        return `<div class="text-indent">${arg} )</div>`;
      }
      return arg;
    });
    return `<div class="function-text"> ${displayArgs.join('')} </div>`;
  }
  return name + ' (' + displayArgs.join(', ') + ' )';
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

    if (state.doneCallee_ && !state.doneExec && state.n_ /*&& prevState.node.type !== 'ReturnStatement'*/ ) {
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
      let className = (nodes.length === 0) ? 'function function-root' : 'function function-calling';
      let calleeNode = {
        // d3 fills up the rest of the object,
        // hence nesting for readability
        info: {
          name: calleeName,
          displayArgs,
          displayName: formatDisplayName(calleeName, displayArgs),
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

    if ( /*prevState.node.type !== 'ReturnStatement' &&*/
      state.doneCallee_ && !state.doneExec &&
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

      callerInfo.displayName = formatDisplayName(callerInfo.name, callerInfo.displayArgs);

      return (paramUpdated && enteringFunctionArgs.length === callerInfo.displayArgs.length);
    }
  }

  function removeExitingFunctions(state, interpreter, persistReturnedFunctions) {

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
      let linkState;
      if (prevState.node.type === 'ReturnStatement') {
        // explicit return of function
        exitingLink.target.info.className = 'function function-returning';
        linkState = 'returning';
      } else if (prevState.node.type === 'AssignmentExpression') {
        // implicit return, probably from built-in (eg result = Array(4))
        linkState = 'assignment';
      } else {
        exitingLink.target.info.className = 'function function-returning';
        linkState = 'broken';
      }
      let returnLink = getCallLink(
        exitingLink.target, exitingLink.source, linkState);
      links.pop();
      links.unshift(returnLink);
    }
  }

  function exitNode(exitingNode) {
    // update parameters with data as it returns from callees
    let returnValue = formatInterpreterIdentifier(state.value);
    exitingNode.info.displayName = `return (${returnValue})`;
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
    nodes[0].info.className = 'function-root function-root-finished success transparent';
  }

  return {
    nextStep: setPrevState,
    action,
    getRepresentedNode,
    finish,
  };
}

export default VisibleFunctionUpdater;
