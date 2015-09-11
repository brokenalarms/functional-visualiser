const nestedReturn = {
  id: nestedReturn,
  title: 'Nested returns',
  text: 'Demonstrates argument / param matching and propogation',
  func: function Program() {

    /* This function exists as a proof of concept for testing:
        - passing of literals
        - matching of param names used in calling function
          with the arguments passed in from the parent scope
        - passing back combinations of the two.     */

    function foo(receivedLiteralInFoo) {

      function bar(receivedLiteralInBar, receivedFunctionInBar) {
        return 'returning ' + receivedLiteralInBar +
          ' and ' + receivedFunctionInBar;
      }

      function passToBarAsArgument(receivedLiteralInBar) {
        return "I'm returning from passToBarAsArgument" +
          ' and ' + receivedLiteralInBar;
      }

      return bar(receivedLiteralInFoo, passToBarAsArgument(receivedLiteralInFoo));
    }

    var result = foo("I've been passed into foo");
  },
};

export default nestedReturn;
