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
  function reduce(array, callback, initialValue) {
    var t = array,
      len = t.length >>> 0,
      k = 0,
      value;
    if (arguments.length == 2) {
      value = arguments[1];
    } else {
      while (k < len && !(k in t)) {
        k++;
      }
      value = t[k++];
    }
    for (; k < len; k++) {
      if (k in t) {
        value = callback(value, t[k], k, t);
      }
    }
    return value;
  };

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
