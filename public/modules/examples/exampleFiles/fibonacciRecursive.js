const fibonacciRecursive = {
  id: fibonacciRecursive,
  title: 'Fibonacci sequence',
  func: function Program() {
    /* This example demonstrates a side-effect free,
       functional implementation of the
       Fibonacci sequence. */

    function fibonacci(n) {
      if (n <= 2) {
        return 1;
      }
      return fibonacci(n - 1) + fibonacci(n - 2);
    }

    var result = fibonacci(10);
  },
};
export default fibonacciRecursive;
