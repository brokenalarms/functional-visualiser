/* static helper to provide 'dressed' array of new-scope
(function) nodes for initial static call graph display.
 */
import {parse} from 'acorn';
import estraverse from 'estraverse';
import escodegen from 'escodegen';
import {includes, pluck, uniq as unique, last} from 'lodash';
import DeclarationTracker from '../astTools/DeclarationTracker.js';
import astTools from '../astTools/astTools.js';

function StaticCallGraph() {

  let decTracker = new DeclarationTracker();

  function get(codeToParse) {
    let ast = astTools.createAst(codeToParse, false);
    let [nodes, links] = getCallGraph(ast);
    return [nodes, links];
  }

  function getCallGraph(ast) {
    let scopeChain = [];
    let currentScope = null;
    let nodes = [];
    let links = [];

    estraverse.traverse(ast, {
      enter: function(node, parent) {
        if (astTools.createsNewFunctionScope(node)) {
          currentScope = createNewNode(node, nodes);
          nodes.push(currentScope);
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
          case 'FunctionExpression':
            addFunctionInfo(currentScope, node);
            break;
          case 'CallExpression':
            addFunctionCallRef(currentScope, node);
            break;
        }
      },
      leave: function(node, parent) {
        if (astTools.createsNewFunctionScope(node)) {
          addLinks(currentScope, links);
          decTracker.exitNode(node);
          scopeChain.pop();
          currentScope = last(scopeChain);
        }
      },
    });
    return [nodes, links];
  }

  function createNewNode(node, nodes) {
    let parent;
    let functionName;
    if (node.type === 'Program') {
      parent = null;
      functionName = 'Program';
    } else {
      parent = last(nodes);
      functionName = (node.id) ? node.id.name : 'anonymous';
    }

    let newNode = Object.assign(node, {
      scopeInfo: {
        id: functionName,
        scope: 'scope ' + nodes.length,
        codeString: astTools.createCode(node, {}),
        params: node.params,
        parent,
        declarationsMade: [],
        functionsCalled: [],
      },
    });
    return newNode;
  }

  function addVariableInfo(currentScope, variables, isParam) {
    let varArray = (Array.isArray(variables)) ? variables : [variables];
    varArray.forEach((variable) => {
      if (astTools.typeIsSupported(variable.type)) {
        if (isParam) {
          variable.isParam = true;
        }
        decTracker.set(variable.name, variable.type, currentScope);
        currentScope.scopeInfo.declarationsMade.push(variable);
      }
    });
  }

  function addFunctionInfo(currentScope, node) {
    // if there's no id, it's an anonymous function
    // so can't be referred to elsewhere and therefore
    // doesn't need to be tracked
    if (node.id) {
      decTracker.set(node.id.name, node.type, currentScope);
    }
  }


  function addFunctionCallRef(currentScope, node) {
    // TODO: add support for members and builtins
    if (astTools.typeIsSupported(node.callee.type)) {
      currentScope.scopeInfo.functionsCalled.push({
        calleeName: astTools.getCalleeName(node),
        source: currentScope,
        target: null,
        arguments: node.arguments,
      });
    }
  }

  function addLinks(currentScope, links) {
    currentScope.scopeInfo.functionsCalled.forEach((funcCall) => {
      /* now we're exiting the scope, we can add the target
         and thus account for hoisted functions declared after call */
      funcCall.target = decTracker.get(funcCall.calleeName);
      links.push(funcCall);
    });
  }

  return {
    get,
  };
}

export default new StaticCallGraph;
