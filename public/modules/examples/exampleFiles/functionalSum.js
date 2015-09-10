const functionalSum = {
  id: functionalSum,
  title: 'Sum: functional',
  func: function Program() {

    function reduce(array, iteratee, accumulator, initFromArray) {
      var index = -1;
      var length = array.length;

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
    var sum = sumFunction(numbers);
  },
};

export default functionalSum;