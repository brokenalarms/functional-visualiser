/*  examples constants file.
  every file in example dir has exports.
  can pre-sort by order here for easy adding/removal
  to NavBar.
  */

import funcWithoutReturn from './exampleFiles/funcWithoutReturn.js';
import imperativeSum from './exampleFiles/imperativeSum.js';
import functionalSum from './exampleFiles/functionalSum.js';
import varMutatedOutOfScope from './exampleFiles/varMutatedOutOfScope.js';
import fibonacciRecursive from './exampleFiles/fibonacciRecursive.js';
import nestedReturn from './exampleFiles/nestedReturn.js';
import smashingMagazineDemo from './exampleFiles/smashingMagazine.js';

let examples = [
  funcWithoutReturn,
  imperativeSum,
  functionalSum,
  varMutatedOutOfScope,
  nestedReturn,
  fibonacciRecursive,
  smashingMagazineDemo,
];

export default examples;
