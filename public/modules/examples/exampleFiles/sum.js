'use strict';

const id = 'sum';
const name = 'Sum';
const desc = 'Add an array of numbers';

function imperative() {
  const arrayToSum = [3, 5, 5, 10];
  let sum = 0;

  function sumFunction() {
    for (let i = 0; i < arrayToSum.length; i++) {
      sum += arrayToSum[i];
    }
  }

  sumFunction();
}



function functional() {
  function sumFunction(arrayToSum) {
    return arrayToSum.reduce(function(a, b) {
      return a + b;
    }, 0);
  }

  sumFunction([1, 1]);
  sumFunction([2, 2]);
}

export default {
  id, name, desc, imperative, functional,
};
