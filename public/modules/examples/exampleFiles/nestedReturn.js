const nestedReturn = {
  id: nestedReturn,
  title: 'Nested returns',
  text: 'Demonstrates argument / param matching and propogation',
  func: function Program() {
    function foo(receivedLiteralInFoo) {

      function bar(receivedLiteralInBar, receivedFunctionInBar) {
        return 'returning ' + receivedLiteralInBar + ' and ' + receivedFunctionInBar;
      }

      function passToBarAsArgument(receivedLiteralInBar) {
        return "I'm returning from passToBarAsArgument" + ' and ' + receivedLiteralInBar;
      }

      return bar(receivedLiteralInFoo, passToBar(receivedLiteralInFoo));
    }

    var result = foo("I've been passed into foo");
  },
};

export default nestedReturn;
