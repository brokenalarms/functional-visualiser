const funcWithoutReturn = {
  id: funcWithoutReturn,
  title: 'Function without return',
  func: function Program() {
/* This example demonstrates what happens
   when you exit a function that does
   not return a value (or returns undefined):
   
   you break the function chain!

   An error also occurs if exit a function
   that returns a value, but do not assign
   that result to a function. 

   Finally, you can observe the root node
   behaviour - it gets larger and 'redder'
   the more errors that are made, eventually animating.
*/

    function funcWithoutReturnStatement() {
      // some action without a
      // visible result passed back... 
      var invisible = "I'm not used...";
    }

    function funcWithReturnStatement() {
      return 'returning something...';
    }

    funcWithoutReturnStatement();
    
    funcWithoutReturnStatement();

    
    funcWithReturnStatement();

    var assignedResult = funcWithReturnStatement();
  },
};
export default funcWithoutReturn;
