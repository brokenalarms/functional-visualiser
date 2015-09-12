import WarningHandler from '../WarningHandler/WarningHandler.js';
import {last, pluck, includes} from 'lodash';
// import formatOutput from '../../d3DynamicVisualizer/formatOutput.js';
import astTools from '../../astTools/astTools.js';


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


  // if you think this is horrible, you should have seen it the first 5 times...
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

      // get object type from immediate interpreter scope for formatting otherwise
      let scopeContainingValue = scope;
      while (!(arg.value in scopeContainingValue.properties) &&
        scopeContainingValue.parentScope !== null) {
        scopeContainingValue = scopeContainingValue.parentScope;
      }
      if (arg.value in scopeContainingValue.properties) {
        let interpreterArg = scopeContainingValue.properties[arg.value];
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
        console.error('its a param then, right?');
        debugger;
      }

      // last case - must be referring to a paramName, so
      // match by index to the parent argument passed in
      let enclosingParams = updateNode.paramNodes || [];
      let matchedParamIndex = enclosingParams.indexOf(arg.value);
      if (matchedParamIndex > -1) {
        let parentTokens = updateNode.parent.displayTokens;
        displayTokens[i] = {
          value: parentTokens[matchedParamIndex + 1].value,
          type: parentTokens[matchedParamIndex + 1].type,
        };
        continue;
      } else {
        debugger;
      }
    }

    displayTokens.unshift(funcNameObject);
    return displayTokens;
  }

  function doesDisplayNameNeedUpdating(state, updateNode) {
    let conditionMet = false;
    if (state.scope) {
      scope = state.scope;
      updateNode.variablesDeclaredInScope = Object.keys(scope.properties);
    }
    if (state.func_ && !state.func_.nativeFunc) {
      // get the identifier paramNodes so we can match with variables referring
      // to values declared in its parent scope when we hit the next function
      updateNode.paramNodes = pluck(state.func_.node.params, 'name');
    }

    if (state.n_ && state.value && state.value.isPrimitive) {
      // need to get the interpreter computed values as they appear, eg (n-1)
      // take state.n_ -1 since interpreterComputedArgs does not have
      // a leading function identifier
      updateNode.interpreterComputedArgs[state.n_ - 1] = {
        value: state.value.data.toString(),
        type: state.value.type,
      };
    }


    // don't try to fill in remaining args until the interpreter
    // has finished computing any interpolated ones (eg n-1);
    // once there is state.func_ it has the complete function
    // ready to execute.
    if (updateNode.displayTokens.length > 1 &&
      state.doneCallee_ && state.func_) {
      let newDisplayTokens = fillRemainingDisplayTokens(
        updateNode.displayTokens, updateNode, updateNode.interpreterComputedArgs);

      if (tokensHaveChanged(updateNode.displayTokens, newDisplayTokens)) {
        updateNode.displayName = astTools.joinDisplayTokens(newDisplayTokens);
        updateNode.displayTokens = newDisplayTokens;
        conditionMet = true;
      }

    }
    return conditionMet;
  }
  // ===================================================
  // Update controller
  // update node parameters and provide warning messages
  // ===================================================

  function doesCurrentNodeUpdate(state, updateNode, interpreter) {
    let a = isVariableMutated(state, updateNode);
    let b = doesDisplayNameNeedUpdating(state, updateNode, interpreter);
    return (a || b);
  }

  // ==========================
  // Update helpers
  // ==========================
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

  function matchIdentifiersWithArgs(updateNode) {


    /*    args.forEach((arg, i) => {
          // don't write over the interpreter results we have already
          if (updateNode.updatedDisplayArgs[i] === undefined) {
            let matchIdentifier = astTools.getId(arg);

            // get the type for formatting purposes
            // don't overwrite if already there because
            // this may be the recursing version and change 'function'
            // to 'string' for a parameter passed in
            if (matchIdentifier in scope.properties &&
              updateNode.interpreterArgTypes[i] === undefined) {
              updateNode.interpreterArgTypes[i] = scope.properties[matchIdentifier].type;
            }

            if (arg.type === 'Literal') {
              newArgs[i] = matchIdentifier;
              if (updateNode.interpreterArgTypes[i] === undefined) {
                updateNode.interpreterArgTypes[i] = (isNaN(arg.value)) ?
                  'string' : 'number';
              }
            } else if (arg.type === 'Identifier' && !updateNode.parent.parent) {
              newArgs[i] = matchIdentifier;
            } else if (matchIdentifier in scope.properties &&
              scope.properties[matchIdentifier].isPrimitive) {
              // gets conditions like var i = 20 = length = Array(length);
              newArgs[i] = scope.properties[matchIdentifier].data;
            } else if (arg.arguments) {
              updateNode.interpreterArgTypes[i] = 'function';
              // recursively add arguments for functions passed as arguments
              newArgs[i] = matchIdentifier + ' (' + matchIdentifiersWithArgs(updateNode, arg).join(', ') + ')';
            } else if (updateNode.parent) {
              // if we're in the root scope, there's no params (for this exercise)
              // must need to match param names to arguments passed in from enclosing function
              // - may be more than one level up due to nested functions in parameters
              let enclosingParamsParent = updateNode.parent;
              while (!enclosingParamsParent.paramNodes) {
                enclosingParamsParent = enclosingParamsParent.parent;
              }
              let enclosingParamNames = pluck(enclosingParamsParent.paramNodes, 'name') || [];
              let matchedParamIndex = enclosingParamNames.indexOf(matchIdentifier);
              if (matchedParamIndex > -1) {
                let parentArgumentsPassed = enclosingParamsParent.displayTokens;
                newArgs[i] = parentArgumentsPassed[matchedParamIndex];
                updateNode.interpreterArgTypes[i] = enclosingParamsParent.interpreterArgTypes[matchedParamIndex];
              } else {
                // backup - this covers things like anonymous functions
                newArgs[i] = updateNode.displayTokens[i];
                updateNode.interpreterArgTypes[i] = 'direct';
              }
            } else {
              console.error('should have matched something...');
            }
          } else {
            newArgs[i] = updateNode.updatedDisplayArgs[i];
          }
        });*/
    return newArgs;
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

  function temp(state, updateNode, interpreter) {
    // wait until we're in the scope of the called function,
    // then we know the parent scope will contain all
    // possible calculated primitive values for scope
    // we're interested in
    if (!scope) { //|| !updateNode.displayTokens.length) {
      return false;
    }

    let conditionMet = false;
    // need to fill in the gap now between params and arguments        
    updateNode.updatedDisplayArgs = matchIdentifiersWithArgs(updateNode, state.node);

    if (argsHaveChangedValue(updateNode.displayTokens, updateNode.updatedDisplayArgs)) {
      updateNode.displayTokens = updateNode.updatedDisplayArgs;
      updateNode.updatedDisplayArgs = [];
      conditionMet = true;
    }


    if (conditionMet) {
      updateNode.updateText = true;
      // formatted display args are not kept - need original identifiers
      // for comparison or even more of a mess....learnt this the first time!
      /*    let formattedDisplayArgs = updateNode.displayTokens.map((arg, i) => {
          return formatOutput.interpreterIdentifier({
            type: updateNode.interpreterArgTypes[i],
          }, updateNode.displayTokens[i]);
        });
*/
      let recursion = (updateNode.parent && updateNode.name === updateNode.parent.name);
      //updateNode.displayName = formatOutput.displayName(updateNode.name, formattedDisplayArgs, recursion);
      updateNode.displayName = updateNode.name + '(' + updateNode.displayTokens.join(', ') + ')';
    }
    if (newScope) {
      newScope = false;
      return true;
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
