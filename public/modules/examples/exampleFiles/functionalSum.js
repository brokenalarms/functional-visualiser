const functionalSum = {
  id: functionalSum,
  title: 'Sum: functional',
  func: function Program() {
    /* 
       This example demonstrates adding an
       array in a functional manner, via
       a 'reduce' callback function.

       Note that the program is not 'purely'
       functional, since the accumulator
       variable is mutated each time -
       so the end graph is not wholly green.

       However, variables mutated in scope
       only generate a 'yellow' node and give
       a notice - they do not actually add 
       to the error count, since in practice
       this is not a hard-and-fast requirement
       in a language that is not purely functional. 
    */

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