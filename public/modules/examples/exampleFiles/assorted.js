'use strict';

const id = 'sum';
const name = 'Sum';
const desc = 'Add an array of numbers';

function imperativeSum() {
  const arrayToSum = [3, 5, 5, 10];
  let sum = 0;

  function sumFunction() {
    for (let i = 0; i < arrayToSum.length; i++) {
      sum += arrayToSum[i];
    }
  }

  sumFunction();
}

function functionalSum() {
  function sumFunction(arrayToSum) {
    return arrayToSum.reduce(function(a, b) {
      return a + b;
    }, 0);
  }

  sumFunction([1, 1]);
}

function nestedReturn() {
  function foo() {
    function bar() {
      function baz() {
        return 'result';
      }
      return baz();
    }
    return bar();
  }
  var result = foo();
}

export default {
  id, name, desc, imperativeSum, functionalSum, nestedReturn,
};
