import {parse} from 'acorn';
import estraverse from 'estraverse';
import escope from 'escope';

// ==================================
// stripped down representations of the 
// AST that I want for each block
// ==================================

const astFunctionDeclaration = {
  functionDeclaration: {
    id: {
      name: 'functional',
    },
    params: [],
  },
};

const astFunctionExpressionReturn = {
  id: null,
  params: [{
    name: 'a',
  }, {
    name: 'b',
  }],
  body: {
    body: [{
      type: 'ReturnStatement',
    }],
  },
};

// d3: resulting function block nodes
const d3FunctionNode = {
  name: 'sumFunction',
  enterParams: [],
  exitParams: [],
  variablesDeclaredInScope: [],
};

const d3FunctionLinks = {
  functionCallees: [{}, {}],
};

// d3 resulting function block links

function parseAst(funcObj) {
  const ast = parse(funcObj.toString());
  // const scopeTree = escope.analyze(ast);

  const testFuncList = [];

  estraverse.traverse(ast, {
    enter(node) {
      if (node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression') {
        const d3Node = createD3FunctionBlock(node);
        testFuncList.push(d3Node);
      }
    },
  });

  return testFuncList;
}

function createD3FunctionBlock(node) {
  if (node.id === null) {
    node.id = {name: node.body.body[0].type};
  }
  return node;
}

export default parseAst;
