'use strict';

import {parse} from 'acorn';
import estraverse from 'estraverse';
import escodegen from 'escodegen';
import {includes, pluck, uniq as unique, last} from 'lodash';
import DeclarationTracker from './DeclarationTracker.js'

function getVisPaneNodes(parseString) {
  let d3Nodes = [];
  let d3CallLinks = [];
  let d3HierarchyLinks = [];
  // for writing back to the correct d3Node in leave function
  let d3ScopeChain = [];

  let ast;
  if (typeof parseString === 'string') {
    ast = parse(parseString, {
      locations: true
    });
  } else {
    // allows for the actual function to be passed in
    ast = parse(parseString.toString(), {
      locations: true
    });
  }

  let decTracker = new DeclarationTracker();
  let calleeBuiltins = new CalleeBuiltins();
  let builtins = createD3Node(null);
  builtins.name = builtins.displayText.name = 'Built in functions';

  estraverse.traverse(ast, {
    enter(node) {
        let currentD3Node = last(d3ScopeChain);
        if (createsNewFunctionScope(node)) {
          // create initial d3Node for a function scope
          currentD3Node = createD3Node(node);
          if (node.type === 'Program') {
            currentD3Node.parent = null;
          } else {
            currentD3Node.parent = last(d3ScopeChain);

            d3HierarchyLinks.push({
              source: currentD3Node.parent,
              target: currentD3Node,
              type: 'hierarchy',
            });

            /* add parameters passed to scope chain */
            currentD3Node.params.forEach((param) => {
              decTracker.set(param.name, currentD3Node);
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
              type: declaration.init.type,
            };
            currentD3Node.variablesDeclared.push(variable);
            decTracker.set(variable.name, currentD3Node);
          });
        }

        if (node.type === 'FunctionDeclaration') {
          let func = {
            name: node.id.name,
            type: node.type,
          };
          /* in this case it was actually declared in its parent,
             since we've already created a new d3Node for this scope. */
          currentD3Node.parent.variablesDeclared.push(func);
          // but we want to keep track of the scope of the actual function for referring to later
          decTracker.set(func.name, currentD3Node);
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
          let nodeWhereVariableDeclared = last(decTracker.get(variableName));
          currentD3Node.variablesMutated.push({
            'name': variableName,
            'nodeWhereDeclared': nodeWhereVariableDeclared,
          });
        }

        if (node.type === 'CallExpression') {
          let calleeName;
          let calleeMethod;
          let calleeType;
          if (node.callee.type === 'Identifier') {
            // function is being called directly
            calleeName = calleeMethod = node.callee.name;
          } else if (node.callee.type === 'MemberExpression') {
            /* function called is an object property,
               e.g foo.bar.reduce(). */
            let _ = node.callee;

            // function Name is always in the highest property name
            calleeMethod = _.property.name;

            // method is in the second-highest nested property
            if (_.object.property) {
              calleeName = _.object.property.name;
            } else {
              calleeName = _.object.name;
              calleeType = _.object.type; // for 'ThisExpression' 
            }

            if (_.object.elements) {
              // allow for expression of array literals at top level only
              // TODO - make calleeName an array of _.object.elements[]
              calleeName = 'Native object';
              calleeType = _.object.type;
            } else if (calleeBuiltins.has(calleeMethod)) {
              /* check if function is a builtin; if so get the top memberExpression
                 instead; this is the deepest nested object.name in the array */
              calleeType = calleeBuiltins.getObj(calleeMethod).name;
              while (_.object) {
                _ = _.object;
              }
              calleeName = _.name;
            }
          } else {
            // all possibilities need to be handled here - kill program if there's an error
            throw new Error('Unrecognised type of CallExpression encountered.');
          }

          currentD3Node.functionsCalled.push({
            name: calleeName,
            method: calleeMethod,
            type: calleeType,
            source: currentD3Node,
            target: null,
          });
        }
      },
      leave(node) {

        if (createsNewFunctionScope(node)) {
          let currentD3Node = last(d3ScopeChain);
          if (currentD3Node.functionsCalled.length > 0) {
            // finish building our callLinks now we have the lower scope info
            currentD3Node.functionsCalled.forEach((callee) => {
              let nodeForFunction;
              // allow for callee being encoded as Array object literal
              // TODO loop through and check all callee names
              let calleeName = (Array.isArray(callee.name)) ? callee.name[0] : callee.method;
              nodeForFunction = decTracker.get(calleeName);
              if (nodeForFunction && !isCalleeParam(calleeName, currentD3Node.params)) {
                /* call refers to a user-declared variable, add it to array for that variable.
                   If this is a function passed in via a param, we have no idea 
                   of what scope it came from via static analysis so need to exclude. */
                callee.target = nodeForFunction;
                callee.type = 'call';
                d3CallLinks.push(callee);
              } else if (calleeBuiltins.has(callee.method)) {
                /* add it to the separate object used for tracking builtins used
                   TODO: distinguish by type
                */
                callee.target = builtins;
                builtins.functionsCalled.push(callee.method);
                d3CallLinks.push(callee);
              } else if (!isCalleeParam(callee.name, currentD3Node.params)) {
                throw new Error(`Attempt to look up built-in function failed.
                             Only objects, arrays and literals are being considered
                             in this exercise - not e.g., "new Set()"`);
              }
            });
          }
          decTracker.exitNode(currentD3Node);
          addDisplayText(last(d3ScopeChain));
          d3ScopeChain.pop();
        }
      },
  });

  console.log(escodegen.generate({
    "type": "ReturnStatement",
    "argument": {
      "type": "BinaryExpression",
      "operator": "+",
      "left": {
        "type": "Identifier",
        "name": "a"
      },
      "right": {
        "type": "Identifier",
        "name": "b"
      }
    }
  }));
  addDisplayText(builtins);
  d3Nodes.unshift(builtins);
  return [d3Nodes, {
    d3CallLinks, d3HierarchyLinks,
  }];
}

function createsNewFunctionScope(node) {
  return (node.type === 'Program' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression');
}


function createD3Node(node) {
  let d3Node = {
    displayText: {
      params: null,
      variablesDeclared: '',
      variablesMutated: '',
      functionsCalled: '',
    },
    variablesDeclared: [], // {name, type} all arrays because declarations/mutations may happen multiple times (incorrectly) in single scope
    variablesMutated: [], // {name, nodeWhereDeclared}
    functionsCalled: [], // {name, nodeWhereDeclared}
  };

  if (node) {
    let name;
    if (node.id && node.id.name) {
      name = node.id.name;
    } else {
      name = (node.type === 'Program') ? 'Global scope' : 'Anonymous';
    }
    let paramsArr = [];
    let params = '';
    if (node.params) {
      node.params.forEach((param) => {
        paramsArr.push(param.name);
      });
      params = '('.concat(paramsArr.join(', ')).concat(')');
    }
    Object.assign(d3Node, {
        name,
        params: node.params || null,
          displayText: {
            params, name,
          },
          astNode: node,
      }) // TODO - for debugging only, can remove once structure correct
  }
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

function isCalleeParam(calleeName, params) {
  let paramNames = pluck(params, 'name');
  return includes(paramNames, calleeName);
}

function CalleeBuiltins() {
  /* we've been tracking all variable declarations,
   so the unfound callee -should- either be a named param or a JS built-in.
   I am only dealing with object, arrays and literal built-in functions
   for this exercise but I want to have these tests for stability and
    to make sure the user knows this and that I'm expecting this error. */

  /* I can't do this exactly in a static context for params
     without type checking. So all I can do is check against
     all builtins in scope for this exercise, and assume that
     the program is correct, e.g reduce() only called against arrays. */

  const builtinObjs = [Object, Function, Array, String, Number];
  const browserMethods = ['log', 'error'];

  let builtins = builtinObjs.map((builtInObj) => {
    return Object.getOwnPropertyNames(builtInObj)
      .concat(Object.getOwnPropertyNames(builtInObj.prototype));
  }).concat(browserMethods);

  function has(name) {
    /* if included, a built-in function such as map() or reduce() is being used:
       it's OK that we don't have this in the variablesDeclared. */
    return builtins.some((builtinArr) => {
        return includes(builtinArr, name);
      });
  }

  function getObj(name) {
    let index;
    let _ = builtins.some((builtin, i) => {
      index = i;
      return includes(builtin, name);
    });
    return builtinObjs[index];
  }

  return {
    has, getObj,
  };
}


export default getVisPaneNodes;
