import warningConstants from './warningConstants.js';

// tracks the warnings for each step and overall count.
// modifies properties on the passed nodes directly for
// use by d3.

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
          (opts.actingNode) ? opts.actingNode.name : null, (opts.affectedNode) ? opts.affectedNode.name : null,
          opts.variableName);
    }


    // If a variable error, 
    // don't add 50 errors for 50 mutations of a single array!
    if (opts.variableName) {
      if (!opts.actingNode.warningsInScope.has(opts.variableName)) {
        errorCount += warning.errorValue;
        opts.actingNode.warningsInScope.add(opts.variableName);
      }
    } else {
      errorCount += warning.errorValue;
    }


    let classAssignees = [opts.actingNode, opts.affectedNode];
    // assign a class - but clear class if 
    // the root node and preserve failures
    classAssignees.forEach((node) => {
      if (node) {
        if (node.parentNode !== null) {
          node.status =
            (node.status !== 'failure') ? warning.status : node.status;
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

  return {
    add,
    getErrorCount,
    getCurrentWarning,
    getCurrentWarningAndStep,
  };
}


export default WarningHandler;
