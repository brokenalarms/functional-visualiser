import {last} from 'lodash';

function DeclarationTracker(objType) {
  /* keep track of variable/function declaration set via:
   {variable string: [array containing each d3 scope node the variable is declared in]}
  (so this allows for same name being shadowed at deeper scope)
   extended normal Map functions to manage array access and confine
   the different management of choosing node.parent for function declarations */
  let declarationTracker = new Map();

  function set(key, node) {
    if (declarationTracker.has(key)) {
      declarationTracker.get(key).push(node);
    } else {
      declarationTracker.set(key, [node]);
    }
  }

  function setMap(key, value) {
    if (declarationTracker.has(key)) {
      declarationTracker.get(key).set([value]);
    } else {
      declarationTracker.set(key, (value) ? new Map([value]) : new Map());
    }
  }

  function remove(key) {
    if (declarationTracker.get(key).length > 0) {
      declarationTracker.pop(node);
    } else {
      declarationTracker.delete(key);
    }
  }

  function removeMap(key, name) {
    if (declarationTracker.get(key).size > 0) {
      declarationTracker.get(key).delete(name);
    } else {
      declarationTracker.delete(key);
    }
  }

  function get(key) {
    return declarationTracker.get(key);
  }

  function getLast(key) {
    return last(declarationTracker.get(key));
  }

  function has(key) {
    return declarationTracker.has(key);
  }


  function getDeclaredScope(key) {
    let node = last(declarationTracker.get(key));
    if (node.type === 'FunctionDeclaration') {
      return node.parent;
    }
    return node;
  }

  function isDeclaredInCurrentScope(key, node) {
    return getDeclaredScope(key) === node;
  }

  function exitNode(node) {
    /* clean up - remove any nested function scopes.
       This process allows for same-named variables
       on different scopes to be matched. */
    declarationTracker.forEach((scopeChain, key) => {
      let exitingDeclarationScope = last(scopeChain);
      if (exitingDeclarationScope === node &&
        node.type === 'Identifier') {
        scopeChain.pop();
      } else if (exitingDeclarationScope.parent === node &&
        node.type === 'FunctionDeclaration') {
        scopeChain.pop();
      }
      if (scopeChain.length === 0) {
        declarationTracker.delete(key);
      }
    });
  }

  return (objType === 'array') ? {
    get, getLast, set, has, exitNode, remove,
  } : {
    get, set: setMap, has, remove: removeMap,
  };
}

export default DeclarationTracker;
