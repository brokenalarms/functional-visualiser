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
  function foo(fooParamReceived) {
    function bar(barParamReceived) {
      function baz(bazParamReceived) {
        return 'result';
      }
      return baz(barParamReceived);
    }
    return bar(fooParamReceived);
  }
  var result = foo('fooParamPassed');
}

export default {
  id, name, desc, imperativeSum, functionalSum, nestedReturn,
};
