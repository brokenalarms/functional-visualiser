const imperativeSum = {
  id: 'imperativeSum',
  title: 'Sum: imperative',
  text: `It is easier to reason about the flow of a program
         when variables are passed directly into a program
         and a result is passed out to assign to a function.

         Here, the variables arrayToSum and sum are mutated
         out of scope, meaning that sumFunction causes
         'side effects'.

         The end result of 'sum' is reliant on this mutation,
         but if sumFunction was private, it may similarly
         have mutated other variables without us knowing...      
          `,
  func: function Program() {

    var arrayToSum = [3, 5, 5, 10];
    var sum = 0;

    var arrayIndices = arrayToSum.map(function(number, i) {
      return i;
    });

    function sumFunction() {
      for (let i = 0; i < arrayToSum.length; i++) {
        sum += arrayToSum[i];
      }
    }

    sumFunction();
  },
};

export default imperativeSum;
