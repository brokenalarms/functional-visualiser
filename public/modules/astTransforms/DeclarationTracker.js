import {last} from 'lodash';

function DeclarationTracker() {
  /* keep track of variable/function declaration set via:
   {variable string: [array containing each d3 scope node the variable is declared in]}
  (so this allows for same name being shadowed at deeper scope)
   extended normal Map functions to manage array access and confine
   the different management of choosing node.parent for function declarations */
  let variablesDeclared = new Map();

  function set(variable, type, node) {
    if (variablesDeclared.has(variable)) {
      variablesDeclared.get(variable).push({type, node});
    } else {
      variablesDeclared.set(variable, [{
        type, node,
      }]);
    }
  }

  function get(variable) {
    return last(variablesDeclared.get(variable)).node;
  }

  function has(variable) {
    return variablesDeclared.has(variable);
  }


  function getDeclaredScope(variable) {
    let node = last(variablesDeclared.get(variable));
    if (node.type === 'FunctionDeclaration') {
      return node.parent;
    }
    return node;
  }

  function isDeclaredInCurrentScope(variable, node) {
    return getDeclaredScope(variable) === node;
  }

  function exitNode(node) {
    /* clean up - remove any nested function scopes.
       This process allows for same-named variables
       on different scopes to be matched. */
    variablesDeclared.forEach((scopeChain, key) => {
      let exitingDeclarationScope = last(scopeChain).node;
      let varType = last(scopeChain).type;
      if (exitingDeclarationScope === node &&
        varType === 'Identifier') {
        scopeChain.pop();
      } else if (exitingDeclarationScope.parent === node &&
        varType === 'FunctionDeclaration') {
        scopeChain.pop();
      }
      if (scopeChain.length === 0) {
        variablesDeclared.delete(key);
      }
    });
  }

  return {
    get, set, has, exitNode,
  };
}

export default DeclarationTracker;
