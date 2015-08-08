'use strict';

import {parse} from 'acorn';
import estraverse from 'estraverse';
import escope from 'escope';

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


/* ===================================
   d3: resulting things I'm interested in
   for block nodes and links
   ===================================*/
const d3FunctionNode = {
  name: 'foo',
  /* I assign ids in case functions are given same name
  in different scopes (so basically, scopeId) */
  scopeId: 1234, // can just store the objects in a set to keep them unique
  enterParams: new Set(),
  variablesDeclared: new Set(), // including functions
  varaiablesMutated: new Set(), // only interested in assignments, not references, so excludes all built-ins eg Object
  functionsCalled: new Set(), // scopeId targets for links
  returnParams: new Set(), // function without return, should only be main program in stateless system?
  parent: {}, // object reference or null for window/global
};

const d3FunctionLinks = [{
  source: 'scopeIdOfCaller',
  target: 'scopeIdOfCallee',
  /* to find the scopeId of Callee, navigate back up the scope
     chain and find the first name match in variablesDeclared */
}];

// END CODE USE FOR DOCUMENTING ONLY

function getVisPaneNodes(funcObj) {
  let scopeChain = [];
  let currentScope = null;
  let currentD3Node = null;
  let funcMap = new Set();
  let d3Nodes = [];
  let d3Links = [];

  const ast = parse(funcObj.toString());
  estraverse.traverse(ast, {
    enter(node) {
        // create initial d3Node for a function scope
        if (createsNewFunctionScope(node)) {
          currentScope = node;
          currentD3Node = createD3Node(node);
          d3Nodes.push(currentD3Node);
          /* only push onto scopeChain once
          createD3Node has captured the
          correct parent node at the end of the scopeChain */
          scopeChain.push(currentScope);
          funcMap.add(currentScope);
        }

        if (node.type === 'VariableDeclaration') {
          // allows for multiple variables declared with single statement
          node.declarations.forEach((declaration) => {
            currentD3Node.variablesDeclared.add(declaration.id.name);
          });
        }

        if (node.type === 'FunctionDeclaration') {
          // same place - higher order functions are just variables too
          currentD3Node.variablesDeclared.add(node.id.name);
        }

        if (node.type === 'AssignmentExpression') {
          /* get name of variables mutated within this scope
             will work for foo = bar = baz as each assignee
             is nested recursively in the 'left' property */
          currentD3Node.varaiablesMutated.add(node.expression.left.name);
        }

        if (node.type === 'CallExpression') {
          let calleeName = null;
          if (node.callee.type === 'Identifier') {
            // function is being called directly
            calleeName = node.callee.type;
            currentD3Node.functionsCalled.add(calleeName);
          } else if (node.callee.type === 'MemberExpression') {
            // function called is an object property, e.g foo.reduce()
            calleeName = node.callee.property.name;
            currentD3Node.functionsCalled.add(calleeName);
          } else {
            console.error('Unrecognised type of CallExpression encountered.');
          }
          /* d3 converts to direct object references anyway
             when generating links - so doing this directly here */
          d3Links.push({
            source: currentD3Node,
            target: null,
          });
        }
      },

      exit(node) {
        if (createsNewFunctionScope(node)) {
          /* heading up the scope chain - so find the first
             point at which the target name of a declaration
             matches the source link name */
          let currentD3Link = d3links[d3Links.length - 1];
          if (currentD3Node.variablesDeclared
            .has(currentD3Link.source.name) &&
            currentD3Link.target !== null) {
            currentD3Link.target = currentD3Node;
          }
          if (node.type === 'Program') {
            d3Node.parent = null;
          } else {
            d3Node.parent = scopeChain.pop();
          }
        }
      }
  });
  return d3Nodes;
}

function createsNewFunctionScope(node) {
  return (node.type === 'Program' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression');
}


function createD3Node(node) {
  let name = '';
  if (node.id && node.id.name) {
    name = node.id.name;
  } else {
    name = (node.type === 'Program') ? 'Global' : 'Anonymous';
  }
  let d3Node = {
    name: name,
    params: node.params,
    variablesDeclared: new Set(),
    varaiablesMutated: new Set(),
    functionsCalled: new Set(),
  };
  // TODO - for debugging only, can remove once structure correct
  d3Node.astNode = node;
  return d3Node;
}

function createD3FunctionBlock(node) {
  if (node.id === null) {
    node.id = {
      name: node.body.body[0].type,
    };
  }
  return node;
}

export default getVisPaneNodes;
