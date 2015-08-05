import {parse} from 'acorn';
import estraverse from 'estraverse';
import escope from 'escope';


function parseAst(funcObj) {
  const ast = parse(funcObj.toString());
  // const scopeTree = escope.analyze(ast);

  const testFuncList = [];

  estraverse.traverse(ast, {
    enter(node) {
      if (node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression') {
        testFuncList.push(node);
      }
    },
  });

  return testFuncList;
}

export default parseAst;
