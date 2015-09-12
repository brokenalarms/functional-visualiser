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

  function getComputedDisplayTokens(currentTokens, scope) {
    // same as getInitialDisplayArgs, but this time adapted for
    // interpreter results rather than nodes, to update
    // any arguments with computed interpreter results
    if (currentTokens.length <= 1) {
      // return function name only
      return [{
        value: currentTokens[0],
        type: 'string',
      }];
    }

    let displayArgs = [];
    let currentArgs = currentTokens.slice();
    let funcNameObject = currentArgs.shift();
    currentArgs.forEach((arg, i) => {

      if (Array.isArray(arg)) {
        displayArgs[i] = getComputedDisplayTokens(arg, scope);
      } else {

        if (arg.value in scope) {
          let interpreterArg = scope[arg.value];
          if (interpreterArg.isPrimitive) {
            displayArgs[i] = {
              value: interpreterArg.data.toString(),
              type: interpreterArg.type,
            };
          } else {
            debugger;
            displayArgs[i] = {
              value: null,
              type: interpreterArg.type,
            };
          }
        } else {
          // this value is just a literal:
          // keep the original value
          displayArgs[i] = currentArgs[i];
        }
      }
    });

    displayArgs.unshift(funcNameObject);
    return displayArgs;
  }


  function doesDisplayNameNeedUpdating(state, updateNode) {
    let conditionMet = false;
    if (state.scope) {
      scope = state.scope.properties;
      updateNode.variablesDeclaredInScope = Object.keys(scope);
    }

    console.log(updateNode.name)
    if (state.doneCallee_ && state.value.data === updateNode.name && state.node.arguments.length > 0) {
      // refresh list of variables declared in that scope,
      // Use these for seeing if variables out of function scope were mutated (side effects)
      // getComputedDisplayTokens(updateNode.name, state.node.arguments);
      let newDisplayTokens = getComputedDisplayTokens(updateNode.displayArgs, scope);

      if (argsHaveChanged(updateNode.displayArgs, newDisplayTokens)) {
        updateNode.displayName = astTools.joinDisplayTokens(newDisplayTokens);
        updateNode.displayArgs = newDisplayTokens;
        conditionMet = true;
      }

      /*      if (state.func_ && !state.func_.nativeFunc) {
              // get the identifier paramNodes so we can match with variables referring
              // to values declared in its parent scope when we hit the next function
              updateNode.paramNodes = state.func_.node.params;
            }*/
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
                let parentArgumentsPassed = enclosingParamsParent.displayArgs;
                newArgs[i] = parentArgumentsPassed[matchedParamIndex];
                updateNode.interpreterArgTypes[i] = enclosingParamsParent.interpreterArgTypes[matchedParamIndex];
              } else {
                // backup - this covers things like anonymous functions
                newArgs[i] = updateNode.displayArgs[i];
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

  function argsHaveChanged(initArgs, updateArgs) {
    // check for gaps in sparse array or some updateArgs missing.
    // Not ready to display until all arguments are available (if there are any at all)
    if (initArgs.length === 0) {
      return false;
    }

    for (let i = 0, length = initArgs.length; i < length; i++) {
      if (initArgs[i] !== updateArgs[i]) {
        return true;
      }
      if (i === length - 1) {
        return false;
      }
    }
  }

  function temp(state, updateNode, interpreter) {
    // wait until we're in the scope of the called function,
    // then we know the parent scope will contain all
    // possible calculated primitive values for scope
    // we're interested in
    if (!scope) { //|| !updateNode.displayArgs.length) {
      return false;
    }

    let conditionMet = false;
    // need to fill in the gap now between params and arguments        
    updateNode.updatedDisplayArgs = matchIdentifiersWithArgs(updateNode, state.node);

    if (argsHaveChangedValue(updateNode.displayArgs, updateNode.updatedDisplayArgs)) {
      updateNode.displayArgs = updateNode.updatedDisplayArgs;
      updateNode.updatedDisplayArgs = [];
      conditionMet = true;
    }


    if (conditionMet) {
      updateNode.updateText = true;
      // formatted display args are not kept - need original identifiers
      // for comparison or even more of a mess....learnt this the first time!
      /*    let formattedDisplayArgs = updateNode.displayArgs.map((arg, i) => {
          return formatOutput.interpreterIdentifier({
            type: updateNode.interpreterArgTypes[i],
          }, updateNode.displayArgs[i]);
        });
*/
      let recursion = (updateNode.parent && updateNode.name === updateNode.parent.name);
      //updateNode.displayName = formatOutput.displayName(updateNode.name, formattedDisplayArgs, recursion);
      updateNode.displayName = updateNode.name + '(' + updateNode.displayArgs.join(', ') + ')';
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
