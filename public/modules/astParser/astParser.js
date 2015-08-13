'use strict';

import {parse} from 'acorn';
import estraverse from 'estraverse';
import {includes, pluck, uniq as unique, last} from 'lodash';

function getVisPaneNodes(parseString) {
  let d3Nodes = [];
  let d3CallLinks = [];
  let d3HierarchyLinks = [];
  // for writing back to the correct d3Node in leave function
  let d3ScopeChain = [];

  let ast;
  if (typeof parseString === 'string') {
    ast = parse(parseString);
  } else {
    // allows for the actual function to be passed in
    ast = parse(parseString.toString());
  }

  let varTracker = variablesTracker();

  estraverse.traverse(ast, {
    enter(node) {
        let currentD3Node = last(d3ScopeChain);
        if (createsNewFunctionScope(node)) {
          // create initial d3Node for a function scope
          currentD3Node = createD3Node(node);
          if (node.type === 'Program') {
            currentD3Node.parent = null;
          } else {
            currentD3Node.parent = last(d3Nodes);

            d3HierarchyLinks.push({
              source: currentD3Node.parent,
              target: currentD3Node,
              type: 'hierarchy',
            });

            /* add parameters passed to scope chain */
            currentD3Node.params.forEach((param) => {
              varTracker.set(param.name, currentD3Node);
            });
          }
          /* only push onto d3Nodes once
          createD3Node has captured the
          correct parent node at the end of chain */
          d3Nodes.push(currentD3Node);
          d3ScopeChain.push(currentD3Node);
        }

        if (node.type === 'VariableDeclaration') {
          // allows for multiple variables declared with single statement
          node.declarations.forEach((declaration) => {
            let variable = {
              name: declaration.id.name,
              type: declaration.init.type.replace('Expression', ''),
            };
            currentD3Node.variablesDeclared.push(variable);
            varTracker.set(variable.name, currentD3Node);
          });
        }

        if (node.type === 'FunctionDeclaration') {
          let func = {
            name: node.id.name,
            type: 'Function',
          };
          /* in this case it was actually declared in its parent,
             since we've already created a new d3Node for this scope. */
          currentD3Node.parent.variablesDeclared.push(func);
          // but we want to keep track of the scope of the actual function for referring to later
          varTracker.set(func.name, currentD3Node);
        }

        if (node.type === 'AssignmentExpression') {
          let variableName;
          if (node.left.type === 'Identifier') {
            /* straight assignment to variable, not property
               get name of variables mutated within this scope
               will work for foo = bar = baz as each assignee
               is nested recursively in the 'left' property */
            variableName = node.left.name;
          } else if (node.left.type === 'MemberExpression') {
            /* property has been mutated - for this exercise,
               this just counts as some mutation to the data structure
               of the parent variable, so just get that */
            let _ = node.left;
            while (_.object) {
              _ = _.object;
            }
            variableName = _.name;
          } else {
            throw new Error('unrecognised AssignmentExpression syntax.');
          }

          // save reference to where the variable was actually defined
          let nodeWhereVariableDeclared = last(varTracker.get(variableName));
          currentD3Node.variablesMutated.push({
            'name': variableName,
            'nodeWhereDeclared': nodeWhereVariableDeclared,
          });
        }

        if (node.type === 'CallExpression') {
          let calleeName;
          if (node.callee.type === 'Identifier') {
            // function is being called directly
            calleeName = node.callee.name;
          } else if (node.callee.type === 'MemberExpression') {
            // function called is an object property, e.g foo.reduce() - take the last property
            calleeName = node.callee.property.name;
          } else {
            // all possibilities need to be handled here - kill program if there's an error
            throw new Error('Unrecognised type of CallExpression encountered.');
          }

          currentD3Node.functionsCalled.push({
            name: calleeName,
            source: currentD3Node,
            target: null,
          });
        }
      },
      leave(node) {
        let currentD3Node = last(d3ScopeChain);

        if (createsNewFunctionScope(node)) {
          if (currentD3Node.functionsCalled.length > 0) {
            // finish building our callLinks now we have the lower scope info
            currentD3Node.functionsCalled.forEach((callee) => {
              let nodeForFunction = varTracker.get(callee.name);
              if (nodeForFunction) {
                // call refers to a user-declared variable, add it to array for that variable.
                callee.target = nodeForFunction;
                callee.type = 'call';
                d3CallLinks.push(callee);
              } else if (!isCalleeParamOrBuiltin(callee.name, currentD3Node.params)) {
                throw new Error(`Attempt to look up built-in function failed.
                             Only objects, arrays and literals are being considered
                             in this exercise - not e.g., "new Set()"`);
              }
            });
          }


          varTracker.exitNode(currentD3Node);
          addDisplayText(last(d3ScopeChain));

          d3ScopeChain.pop();
        }
      },
  });

  // helps to avoid initial entanglement of graph
  d3CallLinks.sort((a, b) => {
    return a.source.functionsCalled.length < b.source.functionsCalled.length;
  });
  return [d3Nodes, {
    d3CallLinks, d3HierarchyLinks,
  }];
}

function variablesTracker() {
  /* keep track of variable/function declaration set via:
   {variable string: [array containing each d3 scope node the variable is declared in]}
  (so this allows for same name being shadowed at deeper scope)
   extended normal Map functions to manage array access and confine
   the different management of choosing node.parent for function declarations */
  let variablesDeclared = new Map();

  function set(variable, d3Node) {
    if (variablesDeclared.has(variable)) {
      variablesDeclared.get(variable).push(d3Node);
    } else {
      variablesDeclared.set(variable, [d3Node]);
    }
  }

  function get(variable) {
    return last(variablesDeclared.get(variable));
  }

  function has(variable) {
    return variablesDeclared.has(variable);
  }

  function getDeclaredScope(variable) {
    let node = last(variablesDeclared.get(variable));
    let varType = (node.variablesDeclared.filter((varObj) => {
      return varObj.name === variable;
    })).type;
    if (varType === 'Function') {
      return node.parent;
    }
    return node;
  }

  function exitNode(d3Node) {
    /* clean up - remove any nested function scopes.
       This process allows for same-named variables
       on different scopes to be matched. */
    variablesDeclared.forEach((scopeChain, key) => {
      if (scopeChain.length > 1) {
        let outerScope = scopeChain[length - 2];
        if (outerScope === d3Node) {
          scopeChain.pop();
          if (scopeChain.length === 1) {
            variablesDeclared.delete(key);
          }
        }
      }
    });
  }

  return {
    get, set, has, exitNode,
  };
}

function createsNewFunctionScope(node) {
  return (node.type === 'Program' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression');
}


function createD3Node(node) {
  let name;
  if (node.id && node.id.name) {
    name = node.id.name;
  } else {
    name = (node.type === 'Program') ? 'Global scope' : 'Anonymous';
  }
  let params = [];
  let paramsText = '';
  if (node.params) {
    node.params.forEach((param) => {
      params.push(param.name);
    });
    paramsText = '('.concat(params.join(', ')).concat(')');
  }

  let d3Node = {
    name: name,
    params: node.params || null,
    displayText: {
      functionName: name,
      params: paramsText,
      variablesDeclared: '',
      variablesMutated: '',
      functionsCalled: '',
    },
    variablesDeclared: [], // {name, type} all arrays because declarations/mutations may happen multiple times (incorrectly) in single scope
    variablesMutated: [], // {name, nodeWhereDeclared}
    functionsCalled: [], // {name, nodeWhereDeclared}
  };
  // TODO - for debugging only, can remove once structure correct
  d3Node.astNode = node;
  return d3Node;
}

// TODO - make this update function, give to d3, and give [{name, class based on correctness}]
function addDisplayText(currentD3Node) {
  // do the work basic work here for d3 so it doesn't repeat transformations on update

  ['variablesDeclared', 'variablesMutated', 'functionsCalled'].forEach((textGroup) => {
    currentD3Node.displayText[textGroup] = getTextFromArray(currentD3Node[textGroup]);
  });

  function getTextFromArray(d) {
    // extract into array then remove duplicates
    if (d.length === 0) {
      return 'No entries.';
    }
    let textArray = d.reduce((a, b) => {
      let name = (b.name) ? b.name : 'Anonymous';
      return a.concat(name);
    }, []);
    let textSet = unique(textArray);
    return textSet.join(', ');
  }
}

function isCalleeParamOrBuiltin(calleeName, params) {
  /* we've been tracking all variable declarations,
   so the unfound callee -should- either be a named param or a JS built-in.
   I am only dealing with object, arrays and literal built-in functions
   for this exercise but I want to have these tests for stability and
    to make sure the user knows this and that I'm expecting this error. */
  let paramNames = pluck(params, 'name');

  if (includes(paramNames, calleeName)) {
    return true;
  }
  /* I can't do this exactly in a static context for params
     without type checking. So all I can do is check against
     all builtins in scope for this exercise, and assume that
     the program is correct, e.g reduce() only called against arrays. */

  const builtInObjs = [Object, Function, Array, String, Number];

  let builtIns = builtInObjs.reduce((a, b) => {
    return a.concat(Object.getOwnPropertyNames(b))
      .concat(Object.getOwnPropertyNames(b.prototype));
  }, []);
  if (includes(builtIns, calleeName)) {
    /* a built-in function such as map() or reduce() is being used:
       it's OK that we don't have this in the variablesDeclared. */
    return true;
  }
  return false;
}


export default getVisPaneNodes;
