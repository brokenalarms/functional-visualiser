/* static helper to provide 'dressed' array of new-scope
(function) nodes for initial static call graph display.
 */
import {parse} from 'acorn';
import estraverse from 'estraverse';
import escodegen from 'escodegen';
import {includes, pluck, uniq as unique, last} from 'lodash';
import DeclarationTracker from './DeclarationTracker.js';
import astTools from './astTools.js';

function StaticCallGraph() {

  let decTracker = new DeclarationTracker();

  function get(codeToParse) {
    let ast = astTools.createAst(codeToParse);
    let [nodes, links] = getCallGraph(ast);
    return [nodes, links];
  }

  function addLinks(currentScope, callLinks) {
    currentScope.scopeInfo.functionsCalled.forEach((funcCall) => {
      /* now we're exiting the scope, we can add the target
         and thus account for hoisted functions declared after call */
      funcCall.target = decTracker.get(funcCall.calleeName);
      callLinks.push(funcCall);
    });
  }

  function getCallGraph(ast) {
    let scopeChain = [];
    let currentScope = null;
    let functionNodes = [];
    let callLinks = [];

    estraverse.traverse(ast, {
      enter: function(node, parent) {
        if (astTools.createsNewFunctionScope(node)) {
          currentScope = createNewNode(node, functionNodes);
          functionNodes.push(currentScope);
          scopeChain.push(currentScope);

          let params = node.params;
          if (params && params.length > 0) {
            addVariableInfo(currentScope, params, true);
          }
        }
        switch (node.type) {
          case 'VariableDeclarator':
            // TODO: currently works for single assignment only
            addVariableInfo(currentScope, node.id);
            break;
          case 'FunctionDeclaration':
            addFunctionInfo(currentScope, node);
            break;
          case 'CallExpression':
            addFunctionCallRef(currentScope, node);
            break;
        }
      },
      leave: function(node, parent) {
        if (astTools.createsNewFunctionScope(node)) {
          addLinks(currentScope, callLinks);
          decTracker.exitNode(node);
          scopeChain.pop();
          currentScope = last(scopeChain);
        }
      },
    });
    return [functionNodes, callLinks];
  }

  function createNewNode(node, functionNodes) {
    let parent;
    let functionName;
    if (node.type === 'Program') {
      parent = null;
      functionName = 'Program';
    } else {
      parent = last(functionNodes);
      functionName = node.id.name;
    }

    let newNode = Object.assign(node, {
      scopeInfo: {
        id: 'scope' + (functionNodes.length) + functionName,
        parent,
        declarationsMade: [],
        functionsCalled: [],
      },
    });
    return newNode;
  }

  function typeIsIdentifier(type) {
    if (type !== 'Identifier') {
      throw new Error('Only Identifier variable types currently supported.');
    }
    return true;
  }

  function addVariableInfo(currentScope, variables, isParam) {
    let varArray = (Array.isArray(variables)) ? variables : [variables];
    varArray.forEach((variable) => {
      if (typeIsIdentifier(variable.type)) {
        if (isParam) {
          variable.isParam = true;
        }
        decTracker.set(variable.name, variable.type, currentScope);
        currentScope.scopeInfo.declarationsMade.push(variable);
      }
    });
  }

  function addFunctionInfo(currentScope, node) {
    // TODO: maybe need to add declaredInfo to parent
    decTracker.set(node.id.name, node.type, currentScope);
  }


  function addFunctionCallRef(currentScope, node) {
    // TODO: add support for members and builtins
    if (typeIsIdentifier(node.callee.type)) {
      currentScope.scopeInfo.functionsCalled.push({
        calleeName: node.callee.name,
        source: currentScope,
        target: null,
        arguments: node.arguments,
      });
    }
  }

  return {
    get,
  };
}

export default new StaticCallGraph;
