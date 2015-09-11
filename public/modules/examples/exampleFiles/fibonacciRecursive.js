const fibonacciRecursive = {
  id: fibonacciRecursive,
  title: 'Fibonacci sequence',
  func: function Program() {
    /* This example demonstrates a side-effect free,
       functional implementation of the
       Fibonacci sequence. 

       Try turning down the sequencer delay
       (under the dropdown Options menu at the
        top right of the App bar)
       to the minimum, and see it go!

       All of the 'Dynamic Visualization' options
       can also be adjusted on the fly, whilst
       the visualization is running.
    */

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
