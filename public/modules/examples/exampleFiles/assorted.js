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

function fibonacciLoop() {
  var result = [];

  function fibonacci(n, output) {
    var a = 1,
      b = 1,
      sum;
    for (var i = 0; i < n; i++) {
      output.push(a);
      sum = a + b;
      a = b;
      b = sum;
    }
  }
  fibonacci(16, result);
}

function fibonacciRecursive() {
  function fibonacci(n) {
    if (n <= 2) {
      return 1;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
  }

  var result = fibonacci(8);
}

export default {
  imperativeSum, functionalSum, nestedReturn,
  fibonacciLoop, fibonacciRecursive,
};
