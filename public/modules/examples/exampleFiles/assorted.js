'use strict';

const id = 'sum';
const name = 'Sum';
const desc = 'Add an array of numbers';

function imperativeSum() {
  const arrayToSum = [3, 5, 5, 10];
  let sum = 0;
  var length = 2;
  //var result = Array(length);
  var index = -1,
    result = Array(length);

  function sumFunction(length) {
    result = Array(length)
    for (let i = 0; i < arrayToSum.length; i++) {
      sum += arrayToSum[i];
    }
  }

  sumFunction(4);
}

function functionalSum() {

  function reduce(array, iteratee, accumulator, initFromArray) {
    var index = -1,
      length = array.length;

    if (initFromArray && length) {
      accumulator = array[++index];
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array[index], index, array);
    }
    return accumulator;
  }

  function sumFunction(arrayToSum) {
    return reduce(arrayToSum, function(a, b) {
      return a + b;
    }, 0);
  }
  var numbers = [1, 1, 4, 6, 10, 50, 500];
  sumFunction(numbers);

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

  function funcWithoutReturn() {

  }
  funcWithoutReturn();
  var result = foo('fooParamPassed');
}

function fibonacciRecursive() {
  function fibonacci(n) {
    if (n <= 2) {
      return 1;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
  }

  var result = fibonacci(3);
}

export default {
  imperativeSum, functionalSum, nestedReturn,
  fibonacciRecursive,
};
