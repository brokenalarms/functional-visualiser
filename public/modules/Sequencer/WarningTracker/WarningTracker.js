import warningConstants from './warningConstants.js';

function WarningTracker() {

  let errorCount = 0;
  let warning = null;

  function add(actingNode, affectedNode, warningString) {
    if (arguments.length === 2) {
      warningString = arguments[1];
      affectedNode = null;
    }

    warning =
      warningConstants[warningString].get(actingNode.name);
    // don't add 50 errors for 50 mutations of a single array!
    if (!actingNode.warningsInScope.has(warning.message)) {
      errorCount++;
    }
    actingNode.warningsInScope.add(warning.message);

    if (affectedNode) {
      // add error state to the other node too,
      // if supplied and not the root node.
      let parent = affectedNode.caller;
      if (parent) {
        if (parent.caller !== null) {
          affectedNode.source.status = 'warning';
        } else {
          // d3 handles the coloring of rootNode directly
          // in proportion to amount of errors -
          // let it take over now
          parent.status = '';
        }
      }
    }
  }

  function getErrorCount() {
    return errorCount;
  }

  function getCurrentWarning() {
    let returnWarning = warning;
    warning = null;
    return warning;
  }

  function reset() {
    errorCount = 0;
  }


  return {
    add,
    getErrorCount,
    getCurrentWarning,
    reset,
  };
}


export default new WarningTracker;
