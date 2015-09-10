const varMutatedOutOfScope = {
  id: varMutatedOutOfScope,
  title: 'Variable mutations',
  text: '',
  func: function Program() {
    // this example demonstrates the effect of
    // mutating a variable that was not declared
    // in the same scope (no side effects allowed)
    // The node mutating and the node (scope) in which the
    // variable was initially declared are both highlighted.

    function foo() {
      bar = 'mutation';
    }

    var bar = 'declaration';
    foo();
  },
};
export default varMutatedOutOfScope;
