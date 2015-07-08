import { parse } from 'acorn';
import React from 'react';

console.log('about to parse...');


import script from './examples/functional.js';
var ast = parse(script);

var profile = <div></div>;

console.log(ast);