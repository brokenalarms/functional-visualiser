const funcWithoutReturn = {
  id: funcWithoutReturn,
  title: 'Function without return',
  func: function Program() {
    function funcWithoutReturn() {
      // some action without a
      // visible result passed back... 
      var invisible = "I'm not used...";
    }

    function funcWithReturn() {
      return 'returning something...';
    }

    funcWithoutReturn();
    
    funcWithoutReturn();

    funcWithReturn();

    var assignedResult = funcWithReturn();
  },
};
export default funcWithoutReturn;
