//FIXME: lodge gitHub issue as their ES6 import system isn't working...
// const parse = require('shift-parser');
// import {parseScript as parse} from 'shift-parser';
// import {analyze as analyzeScope} from 'shift-scope';

let parse = require("shift-parser").parseScript;
let analyze = require('shift-scope').default;
let ScopeType = require('shift-scope').ScopeType;
let DeclarationType = require('shift-scope').DeclarationType;

(function createAst() {

  let ast = parse(`

"use strict";

let [x,y,z] = [1,2,3].map( _ => _ * 2 );

class Person {
    constructor(name) {
        this.name = name
    }
}

`);
  let astScope = analyze(ast);
  debugger;
  return ast;
})()

export default createAst;
