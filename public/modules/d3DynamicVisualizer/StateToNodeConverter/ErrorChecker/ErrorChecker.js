import {includes} from 'lodash';
import WarningHandler from './WarningHandler/WarningHandler.js';
import astTools from '../../../astTools/astTools.js';

function ErrorChecker() {

  let warningHandler = new WarningHandler();

  function doesFunctionReturn(state, node) {
    // check for explicit return of function
    let conditionMet = true;
    if ((state.doneCallee_) &&
      (state.value.isPrimitive && state.value.data !== undefined) ||
      !state.value.isPrimitive) {
      if (node.status === 'normal') {
        // leave returned functions in error state
        // if they generated warnings
        node.status = 'returning';
      }
    } else {
      conditionMet = false;
      warningHandler.add({
        key: 'functionDoesNotReturnValue',
        actingNode: node,
      });
    }
    return conditionMet;
  }

  function isVariableMutated(state, updateNode) {
    let errorMessageAlreadyGivenForVar = false;
    let assignmentMade = false;
    if (state.node.type === 'AssignmentExpression' &&
      (state.doneLeft === true && state.doneRight === true)) {
      assignmentMade = true;

      let assignedExpression = (state.node.left.type !== 'MemberExpression') ?
        state.node.left.name : astTools.getEndMemberExpression(state.node.left);
      errorMessageAlreadyGivenForVar = (updateNode.warningsInScope.has(assignedExpression));

      if (!(includes(updateNode.variablesDeclaredInScope, assignedExpression))) {
        let nodeContainingVar = updateNode;
        let varPresentInScope = false;
        while (nodeContainingVar.parentNode !== null && !varPresentInScope) {
          nodeContainingVar = nodeContainingVar.parentNode;
          varPresentInScope = includes(nodeContainingVar.variablesDeclaredInScope, assignedExpression);
        }
        if (varPresentInScope) {
          // highlight both the mutation node and the affected node
          warningHandler.add({
            key: 'variableMutatedOutOfScope',
            actingNode: updateNode,
            affectedNode: nodeContainingVar,
            variableName: assignedExpression,
          });
        } else {
          warningHandler.add({
            key: 'variableDoesNotExist',
            actingNode: updateNode,
            variableName: assignedExpression,
          });
        }
      } else {
        warningHandler.add({
          key: 'variableMutatedInScope',
          actingNode: updateNode,
          variableName: assignedExpression,
        });
      }
    }
    return (assignmentMade && !errorMessageAlreadyGivenForVar);
  }

  function getErrorCountAndCurrentWarning() {
    return [warningHandler.getErrorCount(),
      warningHandler.getCurrentWarningAndStep(),
    ];
  }

  function addUnassignedFunctionWarning(actingNode, affectedNode) {
    warningHandler.add({
      key: 'functionReturnUnassigned',
      actingNode,
      affectedNode,
    });
  }

  return {
    doesFunctionReturn,
    isVariableMutated,
    getErrorCountAndCurrentWarning,
    addUnassignedFunctionWarning,
  };

}

export default ErrorChecker;
