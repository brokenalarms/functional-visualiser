const funcWithoutReturn = {
  id: funcWithoutReturn,
  title: 'Function without return',
  func: function Program() {
    /* 
       Parse the filled-in code, then press
       the 'next' button to step through the
       program and see what happens when you
       exit a function that does not return
       a value (or returns undefined):
       
       you break the function chain!

       An error also occurs if you exit a function
       that returns a value, but do not assign
       that result to a function. 
    */

    function funcWithoutReturnStatement() {
      // some action without a
      // visible result passed back... 
      var invisible = "I'm a blackboxed function...bad";
    }

    function funcWithReturnStatement() {
      return 'I return something...';
    }

    /* this will generate two errors - 
       one for no return, and one for 
       the result being unassigned */
    funcWithoutReturnStatement();

    /* I considered blocking the non-assignment
        error if the function had already
        not returned anything, but figured
        that they were both independent problems
        of each of the functions: the caller
        should be assuming that a blackboxed
        stateless function is returning
        a result that needs to be assigned. */
    funcWithoutReturnStatement();

    /* This only generates a single error: 
       The function successfully returns a 
       value, but this value remains unassigned. */
    funcWithReturnStatement();

    /* 
       Finally, you can observe the root node
       behaviour as indicative of how 'strictly'
       the program is adhering to the principles
       of purely functional patterns:
       it gets larger and 'redder' as more
       errors are made, eventually 'pulsating'.
    */
    funcWithReturnStatement();
    funcWithReturnStatement();
    funcWithReturnStatement();


    /* This statement does not generate either error. */
    var assignedResult = funcWithReturnStatement();
  },
};
export default funcWithoutReturn;
