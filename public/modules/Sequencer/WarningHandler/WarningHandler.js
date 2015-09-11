import warningConstants from './warningConstants.js';

// tracks the warnings for each step and overall count

function WarningHandler() {

  let errorCount = 0;
  let warning = null;

  /* options are:  warningString, actingNode,
  affectedNode, singleInstance,*/
  function add(opts) {
    // will only return one warning per step,
    // so as the more important warnings are lodged
    // first (function returns and assignments),
    // the most important warning is the one shown. 

    // assign warning
    if (!warning) {
      let receivedWarning = warningConstants[opts.key];
      warning =
        receivedWarning.get(
          opts.actingNode.name, (opts.affectedNode) ? opts.affectedNode.name : null);
    }


    // If a variable error, 
    // don't add 50 errors for 50 mutations of a single array!
    if (opts.variableName) {
      if (!opts.actingNode.warningsInScope.has(opts.variableName)) {
        errorCount++;
        opts.actingNode.warningsInScope.add(opts.variableName);
      }
    } else {
      errorCount++;
    }


    let classAssignees = [opts.actingNode, opts.affectedNode];
    // assign a class - but clear class if 
    // the root node and preserve failures
    classAssignees.forEach((node) => {
      if (node) {
        if (node.parent !== null) {
          node.status =
            (node.status !== 'failure') ? warning.status : node.status;
        } else {
          // d3 handles the coloring of rootNode directly
          // in proportion to amount of errors -
          // let it take over from 'success' now
          //  if there is an error affecting it
          node.status = '';
        }
      }
    });

  }

  function getErrorCount() {
    return errorCount;
  }

  function getCurrentWarning() {
    return warning;
  }

  function getCurrentWarningAndStep() {
    let returnWarning = warning;
    warning = null;
    return returnWarning;
  }


  function reset() {
    errorCount = 0;
    warning = null;
  }


  return {
    add,
    getErrorCount,
    getCurrentWarning,
    getCurrentWarningAndStep,
    reset,
  };
}


export default new WarningHandler;
