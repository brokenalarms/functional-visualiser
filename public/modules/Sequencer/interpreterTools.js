// =============================================
// Static helper functions for analysing
// js-interpreter results. Used by the Sequencer.
// =============================================

/* taken from ace-editor: 
   although I'm using 'brace' library to access
   ace-editor, Range wasn't included and so
   needed to remove 'define' function
   and use es6 export to use on browser side */
import Range from '../vendor/range.js';

function isFunctionCall(state, prevState) {
  return (state.scope && prevState.node &&
    prevState.node.type === 'CallExpression');
}

function isReturnToCallee(state, prevState) {
  return ((prevState.node.type === 'ReturnStatement' || prevState.scope) &&
    state.node.type === 'CallExpression');
}


function isExitingFunction(state, prevState, visibleScopes) {
  if (isReturnToCallee(state, prevState)) {
    // we have transformed the function call into a literal result
    let calleeName = getExitingCalleeName(state, prevState);
    if (visibleScopes.has(calleeName) &&
      visibleScopes.get(calleeName) === state.node) {
      // console.log(visibleScopes.get(calleeName) === state.node);
      return true;
    }
  }
  return false;
}

function getExitingCalleeName(state, prevState) {
  // now assuming we have either a valid callee exit or end of expressionStatement
  if (state.node.callee.type === 'Identifier') {
    return state.node.callee.name;
  }
  if (state.node.callee.type === 'FunctionExpression') {
    return state.node.callee.id.name;
  }
  throw new Error('unrecognised callee type for exit from function call');
}

function getCodeRange(state) {
  if (state.node) {
    let loc = state.node.loc;
    let range = new Range(loc.start.line - 1, loc.start.column,
      loc.end.line, loc.end.column);
    return range;
  }
  return null;
}

export default {
  isFunctionCall,
  isReturnToCallee,
  isExitingFunction,
  getExitingCalleeName,
  getCodeRange,
};
