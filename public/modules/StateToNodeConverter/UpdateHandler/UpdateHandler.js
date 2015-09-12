import WarningHandler from '../WarningHandler/WarningHandler.js';
import {last, pluck, includes} from 'lodash';
import astTools from '../../astTools/astTools.js';
import StringTokenizer from '../StringTokenizer/StringTokenizer.js';


function UpdateHandler() {

  // this is the interpreter scope, which is sometimes used
  // for filling in missing primitive values and types if they
  // have been evaluated beyond their original AST node format.
  let scope = null;
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


  // ===================================================
  // Update controller
  // update node parameters and provide warning messages
  // ===================================================

  function doesCurrentNodeUpdate(state, updateNode, interpreter) {

    gatherEnteringFunctionInformation(state, updateNode);

    let a = isVariableMutated(state, updateNode);
    let b = doesDisplayNameNeedUpdating(state, updateNode);
    return (a || b);
  }

  // ==========================
  // Update helpers
  // ==========================

  function gatherEnteringFunctionInformation(state, updateNode) {
    if (state.scope) {
      scope = state.scope;
      updateNode.variablesDeclaredInScope = Object.keys(scope.properties);
    }
    if (state.func_ && !state.func_.nativeFunc) {
      // get the identifier paramNames so we can match with variables referring
      // to values declared in its parent scope when we hit the next function
      updateNode.paramNames = pluck(state.func_.node.params, 'name');
    }

    // computedPrimitive: interpreter has fetched the result for an
    // interpolated function argument, eg (n - 1). Can't calculate
    // these through static analysis so take the interpreter's result now.
    let computedPrimitive =
      state.n_ && state.value && state.value.isPrimitive;
    if (computedPrimitive) {
      // need to get the interpreter computed values as they appear, eg (n-1)
      // take state.n_ -1 since interpreterComputedArgs does not have
      // a leading function identifier
      updateNode.interpreterComputedArgs[state.n_ - 1] = {
        value: state.value.data.toString(),
        type: state.value.type,
      };
    }
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
        while (nodeContainingVar.parent !== null && !varPresentInScope) {
          nodeContainingVar = nodeContainingVar.parent;
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

  function doesDisplayNameNeedUpdating(state, updateNode) {
    let conditionMet = false;

    let updateNodeHasArguments = updateNode.displayTokens.length > 1;

    let gatheredRequirementsForCallee = state.doneCallee_ && !state.doneExec;

    // the interpreter has computed all arguments a function requires
    // and created a wrapped function for it to execute.
    // (Due to an interpreter bug (I think), evaluating `func_` for
    // truthiness returns a copy of the object instead of true or
    // false, hence the Boolean wrapper
    let finishedGatheringArguments = Boolean(state.func_);

    if (updateNodeHasArguments &&
      gatheredRequirementsForCallee && finishedGatheringArguments) {
      let newDisplayTokens = fillRemainingDisplayTokens(
        updateNode.displayTokens, updateNode, updateNode.interpreterComputedArgs);

      if (tokensHaveChanged(updateNode.displayTokens, newDisplayTokens)) {
        updateNode.displayName = StringTokenizer.joinAndFormatDisplayTokens(newDisplayTokens);
        updateNode.displayTokens = newDisplayTokens;
        conditionMet = true;
      }

    }
    return conditionMet;
  }

  function fillRemainingDisplayTokens(currentTokens, updateNode, interpreterComputedArgs) {
    // same as getInitialDisplayArgs, but this time adapted for
    // interpreter results rather than nodes, to update
    // any arguments with computed interpreter results
    if (currentTokens.length === 1) {
      // return function name only
      return [{
        value: currentTokens[0],
        type: 'string',
      }];
    }

    let displayTokens = [];
    let currentArgs = currentTokens.slice();
    let funcNameObject = currentArgs.shift();

    for (let i = 0, length = currentArgs.length; i < length; i++) {
      let arg = currentArgs[i];

      // recursive update for nested argument functions
      if (Array.isArray(arg)) {
        // interpreterComputed args to null for recursion -
        // they are only for top-level primitive results
        displayTokens[i] = fillRemainingDisplayTokens(arg, updateNode, null);
        continue;
      }

      // use the interpreter-calculated primitives
      // if it has already done so (eg for (10 === n) => ((n-1) === 9)))
      if (interpreterComputedArgs && interpreterComputedArgs[i]) {
        displayTokens[i] = interpreterComputedArgs[i];
        continue;
      }

      // pass literals straight through
      // (should be covered by interpreter case above
      // for the top level, but needed for nested args
      // in functions)
      if (arg.type === 'string' || arg.type === 'number') {
        displayTokens[i] = currentArgs[i];
        continue;
      }

      // last case - variable used from outside the scope
      // get object type for formatting
      let scopeContainingValue = scope;
      while (!(arg.value in scopeContainingValue.properties) &&
        scopeContainingValue.parentScope !== null) {
        scopeContainingValue = scopeContainingValue.parentScope;
      }
      if (arg.value in scopeContainingValue.properties) {
        let interpreterArg;
        let property;
        if (arg.object) {
          interpreterArg = scopeContainingValue;
          arg.object.forEach((obj) => {
            interpreterArg = interpreterArg.properties[obj];
          });
          property = scopeContainingValue.properties[arg.property].data;
          interpreterArg = interpreterArg.properties[property];
        } else {
          interpreterArg = scopeContainingValue.properties[arg.value];
        }
        if (interpreterArg.isPrimitive) {
          displayTokens[i] = {
            value: interpreterArg.data.toString(),
            type: interpreterArg.type,
          };
        } else {
          displayTokens[i] = {
            value: arg.value,
            type: interpreterArg.type,
          };
        }
        continue;
      } else {
        displayTokens[i] = arg;
        console.error('display token not matched: ' + arg.value + ', ' + arg.type);
      }
    }
    displayTokens.unshift(funcNameObject);
    return displayTokens;
  }

  function tokensHaveChanged(initTokens, updateTokens) {
    if (initTokens.length === 1) {
      return false;
    }

    for (let i = 0, length = initTokens.length; i < length; i++) {
      if (!updateTokens[i]) {
        // the interpreter needs to calculate these values
        // (eg (n-1) as argument)
        return false;
      }

      if (Array.isArray(initTokens[i])) {
        if (tokensHaveChanged(initTokens[i], updateTokens[i])) {
          return true;
        }
        continue;
      } else if ((initTokens[i].value !== updateTokens[i].value) ||
        (initTokens[i].type !== updateTokens[i].type)) {
        return true;
      } else {
        continue;
      }
      return false;
    }
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
    // updateScopeAndParams,
    doesFunctionReturn,
    doesCurrentNodeUpdate,
    getErrorCountAndCurrentWarning,
    addUnassignedFunctionWarning,
  };
}
export default UpdateHandler;
