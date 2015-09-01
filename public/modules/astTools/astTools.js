'use strict';

/* helper tools for various AST transforms. */

import {parse} from 'acorn';
import estraverse from 'estraverse';
let escodegen = require('escodegen');
import {includes, pluck, uniq as unique, last, chain} from 'lodash';
let ace = require('brace');
let Range = ace.acequire('ace/range').Range;

function astTools() {

  function createAst(codeToParse, createLocations) {
    let parseString = (typeof codeToParse === 'Function') ?
      codeToParse.toString() : codeToParse;
    return parse(parseString, {
      locations: createLocations,
    });
  }

  function createCode(ast, options) {
    return escodegen.generate(ast, options);
  }

  function getCodeRange(node) {
    if (node) {
      let loc = node.loc;
      let range = new Range(loc.start.line - 1, loc.start.column,
        loc.end.line, loc.end.column);
      return range;
    }
    return null;
  }

  function createsNewFunctionScope(node) {
    // Expression statement?
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

  function typeIsSupported(type) {
    if (!(type === 'Identifier' ||
        type === 'FunctionExpression')) {
      throw new Error('Only Identifier variable types currently supported.');
    }
    return true;
  }

  function getCalleeName(node) {
    if (node.callee.type === 'FunctionExpression') {
      return node.callee.id.name;
    }
    if (node.callee.type === 'Identifier') {
      return node.callee.name;
    }
    throw new Error('couldn\'t get callee name');
  }

  function getRunCodeString(codeString) {
    let runFuncString = codeString;
    // check whether function is an immediately invokable function expression (IIFE)
    // code gen makes '})();' into '}());' for some reason so this is covered
    // in the third branch
    if (!(codeString.slice(-1) === ')' || codeString.slice(-2) === ');' || codeString.slice(-4) === '());')) {
      if (!(codeString.slice(-1) === '}' || codeString.slice(-2) === '};')) {
        // allow for commands typed in directly without enclosing function
        runFuncString = `(function Program() { ${codeString} })();`;
      } else {
        // parse typed function as IIFE for interpreter
        runFuncString = '(' + codeString + ')();';
      }
    }
    return runFuncString;
  }

  return {
    astTools, createAst, createCode, createsNewFunctionScope,
    addScopeInfo, getFirstActionSteps, typeIsSupported, getCodeRange, getCalleeName, getRunCodeString,
  };
}

export default astTools();
