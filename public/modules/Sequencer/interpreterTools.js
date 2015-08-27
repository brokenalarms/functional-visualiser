// =============================================
// Static helper functions for analysing
// js-interpreter results. Used by the Sequencer.
// =============================================

let ace = require('brace');
let Range = ace.acequire('ace/range').Range;

function isFunctionCall(state, prevState) {
  /* if the current state has scope, 
     the previous will have a function with args passed in*/
  return (state.scope && prevState.node &&
    prevState.node.type === 'CallExpression');
}

function isReturnToCaller(state, prevState) {
  return (state.node.type === 'CallExpression' &&
    // functions with returns, omitting those that call further functions
    ((prevState.node.type === 'ReturnStatement' && !prevState.node.argument.callee) ||
      // end of unassigned (non-return) FunctionExpression
      prevState.scope));
}

function getCodeRange(node) {
  if (node) {
    let loc = node.loc;
    let range = new Range(loc.start.line - 1, loc.start.column,
      loc.end.line, loc.end.column);
    return range;
  }
  return null;
}

export default {
  isFunctionCall,
  isReturnToCaller,
  getCodeRange,
};
