import {pluck} from 'lodash';
import StringTokenizer from './StringTokenizer/StringTokenizer.js';


function UpdateHandler() {

  // this is the interpreter scope, which is sometimes used
  // for filling in missing primitive values and types if they
  // have been evaluated beyond their original AST node format.
  let scope = null;

  // ===================================================
  // Update controller
  // ===================================================
  function doesDisplayNameNeedUpdating(state, updateNode, interpreter) {
    let conditionMet = false;
    gatherEnteringFunctionInformation(state, updateNode);

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
        updateNode.displayName = StringTokenizer.joinAndFormatDisplayTokens(newDisplayTokens, updateNode.recursion);
        updateNode.updateText = true;
        updateNode.displayTokens = newDisplayTokens;
        conditionMet = true;
      }

    }
    return conditionMet;
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
      let traverseToValue = scope;
      while (!(arg.value in traverseToValue.properties) &&
        traverseToValue.parentScope !== null) {
        traverseToValue = traverseToValue.parentScope;
      }
      if (arg.value in traverseToValue.properties) {
        let property;
        if (arg.object) {

          for (let i = 0; i < arg.object.length - 1; i++) {
            // don't go into the very last one
            traverseToValue = traverseToValue.properties[obj];
          }
          property = traverseToValue.properties[arg.property].data;
          let deepestObjName = arg.object[arg.object.length - 1];
          if (traverseToValue.properties[deepestObjName].properties[property]) {
            traverseToValue = traverseToValue.properties[deepestObjName].properties[property];
          } else {
            // sometimes the index property has increased (eg index++) and I try to read
            // the value before the function ends, causing there to be no value
            // fall back to the the next-highest object 
            // console.error('warning: key not found from object property...falling back to parent object.')
            traverseToValue = traverseToValue.properties[deepestObjName];
          }
        } else {
          traverseToValue = traverseToValue.properties[arg.value];
        }
        if (traverseToValue.isPrimitive) {
          displayTokens[i] = {
            value: traverseToValue.data.toString(),
            type: traverseToValue.type,
          };
        } else {
          displayTokens[i] = {
            value: arg.value,
            type: traverseToValue.type,
          };
        }
        continue;
      } else {
        displayTokens[i] = arg;
        // things like parameters of anonymous functions
        // we don't know at all or want to update, should be of type 'code'. 
        // pass through unchanged in the worst case.
        // console.error('display token not matched: ' + arg.value + ', ' + arg.type);
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

  return {
    doesDisplayNameNeedUpdating,
  };
}
export default UpdateHandler;
