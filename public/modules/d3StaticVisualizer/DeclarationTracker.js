import {last} from 'lodash';

function DeclarationTracker(valueRefType) {
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
      declarationTracker.set(key, node ? [node] : []);
    }
  }

  function keys() {
    return declarationTracker.keys;
  }

  // 2d Map for tracking scope -> declaration -> array of recurring expressions from that declaration
  function setMap(key, valueKey, value) {
    if (declarationTracker.has(key)) {
      // it has the scope
      let foundPrimaryKey = declarationTracker.get(key);
      if (foundPrimaryKey.has(valueKey)) {
        foundPrimaryKey.get(valueKey).push(value);
      } else {
        foundPrimaryKey.set(valueKey, [value]);
      }
    } else {
      declarationTracker.set(key, new Map([
        [valueKey, [value]]
      ]));
    }
  }

  function remove(key) {
    if (declarationTracker.get(key).length > 0) {
      declarationTracker.get(key).pop();
    }
    if (declarationTracker.get(key).length === 0) {
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

  function getMap(key, valueKey) {
    return declarationTracker.get(key);
  }

  function getLast(key) {
    return last(declarationTracker.get(key));
  }

  function getFirst(key) {
    return declarationTracker.get(key)[0];
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

  return (valueRefType === 'array') ? {
    get, getLast, getFirst, set, has, exitNode, remove,
  } : {
    get, set: setMap, has, remove: removeMap,
  };
}

export default DeclarationTracker;
