'use strict';

import {parse} from 'acorn';
import estraverse from 'estraverse';
import {includes, pluck, uniq as unique} from 'lodash';

/* BEGIN CODE USED FOR DOCUMENTING ONLY

   ==================================
   AST: stripped down/ augmented representations
   that I am interested in.
   These will be supplied to the CodePane.
   ================================== */

/* where a new function / scope is created
 (function scoping for this exercise only,
  not ES6 block scoping!) */

/* describes 'function foo () {}'
   note: 'arguments' are passed as an array to a function
   in a CallExpression,
   but in declarations they are stored as 'params'.
*/
const astFunctionDeclared = {
  'type': 'FunctionDeclaration',
  'id': {
    'type': 'Identifier',
    'name': 'foo',
  },
  'params': [],
};

// OR...

/* describes 'var foo = function(){}'
   anonymous functions are just the 'FunctionExpression' object
   with the 'id' set to null.
*/
const astFunctionAssignedToVariable = {
  'type': 'VariableDeclaration',
  'declarations': [{
    'type': 'VariableDeclarator',
    'id': {
      'type': 'Identifier',
      'name': 'foo',
    },
    'init': {
      'type': 'FunctionExpression',
      'id': {
        'type': 'Identifier',
        'name': 'foo',
      },
      'params': [],
    },
  }, ],
};

/* describes function call 'foo(bar, function(){})'
   with an anonymousFunction passed in as an argument */
const astFunctionCalled = {
  'type': 'ExpressionStatement',
  'expression': {
    'type': 'CallExpression',
    'callee': {
      'type': 'Identifier',
      'name': 'foo',
    },
    'arguments': [{
      'type': 'Identifier',
      'name': 'bar',
    }, {
      'type': 'FunctionExpression',
      'id': {
        'type': 'Identifier',
        'name': null,
      },
      'params': [],
      'defaults': [],
      'body': {
        'type': 'BlockStatement',
        'body': [],
      },
    }],
  },
};

/* describes 'reduce' called at end of foo.bar.reduce(a, b),
   that returns a+b.

   I am only interested in top-level 'property.name'
   under 'callee' - nested properties are recursively
   stored under 'object.property.object...etc.
   I have commented that part out.'
*/
const astFunctionCalledasMemberOfObject = {
  'type': 'ExpressionStatement',
  'expression': {
    'type': 'CallExpression',
    'callee': {
      'type': 'MemberExpression',
      /*        'object': {
                'type': 'MemberExpression',
                'object': {
                  'type': 'Identifier',
                  'name': 'foo',
                },
                'property': {
                  'type': 'Identifier',
                  'name': 'bar',
                },
              },*/
      'property': {
        'type': 'Identifier',
        'name': 'reduce',
      },
    },
    'arguments': [{
      'type': 'FunctionExpression',
      'id': null,
      'params': [{
        'type': 'Identifier',
        'name': 'a',
      }, {
        'type': 'Identifier',
        'name': 'b',
      }],
      'defaults': [],
      'body': {
        'type': 'BlockStatement',
        'body': [{
          'type': 'ReturnStatement',
          'argument': {
            'type': 'BinaryExpression',
            'operator': '+',
            'left': {
              'type': 'Identifier',
              'name': 'a',
            },
            'right': {
              'type': 'Identifier',
              'name': 'b',
            },
          },
        }],
      },
    }, {
      'type': 'Literal',
      'value': 0,
      'raw': '0',
    }],
  },
};

const astReturnStatement = {
  'type': 'ReturnStatement',
  'argument': {
    'type': 'Identifier',
    'name': 'foo',
  },
};

/* for each of these mutations,
if the VariableDeclaration did not occur within
the same scope, set a flag
and record a reference to the
object where the VariableDeclaration is made. */

const astVariableMutated = {
  'type': 'ExpressionStatement',
  'expression': {
    'type': 'AssignmentExpression',
    'operator': '+=',
    'left': {
      'type': 'Identifier',
      'name': 'sum',
    },
    'right': {
      'type': 'MemberExpression',
      'computed': true,
      'object': {
        'type': 'Identifier',
        'name': 'arrayToSum',
      },
      'property': {
        'type': 'Identifier',
        'name': 'i',
      },
    },
  },
};

// END CODE USE FOR DOCUMENTING ONLY

function getVisPaneNodes(parseString) {
  let currentD3Node = null;
  let d3Nodes = [];
  let d3Links = [];
  /* keep track of variable/function declaration set via:
   {variable string: [array containing each d3 scope node the variable is declared in]}
  (so this allows for same name being shadowed at deeper scope)*/
  let variablesDeclaredKeyMapChain = new Map();

  // for writing back to the correct d3Node in leave function
  let d3ScopeChain = [];

  let ast;
  if (typeof parseString === 'string') {
    ast = parse(parseString);
  } else {
    // allows for the actual function to be passed in
    ast = parse(parseString.toString());
  }

  estraverse.traverse(ast, {
    enter(node) {
        // create initial d3Node for a function scope
        if (createsNewFunctionScope(node)) {
          currentD3Node = createD3Node(node);
          if (node.type === 'Program') {
            currentD3Node.parent = null;
          } else {
            currentD3Node.parent = d3Nodes[d3Nodes.length - 1];
            /* add parameters passed to scope chain */
            currentD3Node.params.forEach((param) => {
              addToKeyMapChain(variablesDeclaredKeyMapChain, param.name, currentD3Node);
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
            addToKeyMapChain(variablesDeclaredKeyMapChain, variable.name, currentD3Node);
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
          addToKeyMapChain(variablesDeclaredKeyMapChain, func.name, currentD3Node.parent);
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
          let scopeChainForVariable = variablesDeclaredKeyMapChain.get(variableName);
          let nodeWhereVariableDeclared = scopeChainForVariable[scopeChainForVariable.length - 1];
          currentD3Node.variablesMutated.push({
            'name': variableName,
            'nodeWhereDeclared': nodeWhereVariableDeclared,
          });
        }

        if (node.type === 'CallExpression') {
          let calleeName;
          let scopeChainForFunction;
          let nodeWhereFunctionDeclared;
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

          if (variablesDeclaredKeyMapChain.has(calleeName)) {
            // call refers to a user-declared variable, add it to array for that variable.
            scopeChainForFunction = variablesDeclaredKeyMapChain.get(calleeName);
            nodeWhereFunctionDeclared = scopeChainForFunction[scopeChainForFunction.length - 1];
            currentD3Node.functionsCalled.push({
              calleeName, nodeWhereFunctionDeclared,
            });
          } else if (!isCalleeParamOrBuiltin(currentD3Node, calleeName, node, variablesDeclaredKeyMapChain)) {
            throw new Error(`Attempt to look up built-in function failed.
                             Only objects, arrays and literals are being considered
                             in this exercise - not e.g., "new Set()"`);
          }
          /* d3 converts to direct object references anyway
             when generating links - so doing this directly here */
          d3Links.push({
            source: currentD3Node,
            target: null,
          });
        }
      },

      leave(node) {

        if (createsNewFunctionScope(node)) {
          /* heading up the scope chain - so find the first
             point at which the target name of a declaration
             matches the source link name */
          if (d3Links.length > 0) {
            let currentD3Link = d3Links[d3Links.length - 1];
            if (includes(currentD3Node.functionsCalled, currentD3Link.source.name) &&
              currentD3Link.target !== null) {
              currentD3Link.target = currentD3Node;
            }
          }
          /* we're back up to the parent scope,
             remove variables defined in this scope
             (deletion of object property whilst looping
             over properties is safe in JS) */
          variablesDeclaredKeyMapChain.forEach((scopeChain, variableName) => {
            if (scopeChain[scopeChain.length - 1] === currentD3Node) {
              scopeChain.pop();
              if (scopeChain.length === 0) {
                variablesDeclaredKeyMapChain.delete(variableName);
              }
            }
          });
          createDisplayText(d3ScopeChain.pop());
        }
      },
  });
  return [d3Nodes, d3Links];
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
    paramsText =  '('.concat(params.join(', ')).concat(')');
  }

  let d3Node = {
    params: node.params || null,
    displayText: {
      functionName: name,
      params: paramsText,
      variablesDeclared: '',
      variablesMutated: '',
      functionsCalled: '',
    }, // do the work here for d3 so it doesn't repeat transformations on update
    variablesDeclared: [], // {name, type} all arrays because declarations/mutations may happen multiple times (incorrectly) in single scope
    variablesMutated: [], // {name, nodeWhereDeclared}
    functionsCalled: [], // {name, nodeWhereDeclared}
  };
  // TODO - for debugging only, can remove once structure correct
  d3Node.astNode = node;
  return d3Node;
}

function createDisplayText(currentD3Node) {
  let displayTextgroupEntries = ['variablesDeclared', 'variablesMutated', 'functionsCalled'];

  displayTextgroupEntries.forEach((textGroup) => {
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
    return textSet;
  }
}

function addToKeyMapChain(keyMap, variable, d3Node) {
  if (keyMap.has(variable)) {
    keyMap.get(variable).push(d3Node);
  } else {
    keyMap.set(variable, [d3Node]);
  }
}

function isCalleeParamOrBuiltin(currentD3Node, calleeName, node, variablesDeclaredKeyMapChain) {
  /* we've been tracking all variable declarations,
   so the unfound callee -should- either be a named param or a JS built-in.
   I am only dealing with object, arrays and literal built-in functions
   for this exercise but I want to have these tests for stability and
    to make sure the user knows this and that I'm expecting this error. */
  let params = pluck(currentD3Node.params, 'name');

  if (includes(params, calleeName)) {
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
       it's OK that we don't have this in the variablesDeclaredKeyMapChain. */
    return true;
  }
  return false;
}

export default getVisPaneNodes;
