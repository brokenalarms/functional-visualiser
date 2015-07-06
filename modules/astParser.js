import parse from 'shift-parser';

var ast = parse('./examples/functional.js');

console.log(ast);