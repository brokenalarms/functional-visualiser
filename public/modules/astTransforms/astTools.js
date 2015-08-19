'use strict';

// helper tools for various AST transforms.

import {parse} from 'acorn';
import estraverse from 'estraverse';
import escodegen from 'escodegen';
import {includes, pluck, uniq as unique, last, chain} from 'lodash';

function astTools() {

  function createAst(codeToParse, createLocations) {
    let parseString = (typeof codeToParse === 'Function') ?
      codeToParse.toString() : codeToParse;
    return parse(parseString, {
      locations: createLocations,
    });
  }

  function createCode(ast){
    return escodegen.generate(ast);
  }

  function createsNewFunctionScope(node) {
    return (node.type === 'Program' ||
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression');
  }

  function getFirstActionSteps(node) {
    if (node.type === 'FunctionDeclaration') {
      return node.body.body;
    } else if (node.type === 'Program' &&
      node.body[0].type === 'FunctionDeclaration') {
      return node.body[0].body.body;
    }
    console.error(`unrecognised scope passed in`);
  }

  function addScopeInfo(ast) {
    estraverse.traverse(ast, {
      enter(node) {
        if (createsNewFunctionScope(node)) {
          node.scopeInfo = {
            id: 'scope' + functionNodes.length + 'function' + node.id.name,
            parent: (node.type === 'Program') ?
              null : last(functionNodes),
          };
        }
      },
    });
    return ast;
  }

  function createFunctionNodes(ast) {
    let functionNodes = [];
    estraverse.traverse(ast, {
      enter(node) {
        if (createsNewFunctionScope(node)) {
          functionNodes.push(node);
        }
      },
    });
    return functionNodes;
  }

  return {
    astTools, createAst, createsNewFunctionScope,
    addScopeInfo, getFirstActionSteps,
  };
}

export default astTools();
