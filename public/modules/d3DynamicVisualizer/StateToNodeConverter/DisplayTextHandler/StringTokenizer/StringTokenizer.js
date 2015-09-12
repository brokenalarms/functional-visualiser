/* Provides static functions for initial display
	(matching params), update (adding interpreter-computed
	values) and display (reforming to a single string 
	with formatting in line with type.)

	Does so via recursive tokenization, with every
	token assigned its own type for exact formatting
	of potentially deeply-nested functions in parameters.
   */

import astTools from '../../../../astTools/astTools.js';


function StringTokenizer() {

  // recursively tokenizes functions as arguments:
  // e.g., [funcName, arg1, arg2, [funcName, arg1, arg2]].
  function getInitialDisplayTokens(funcName, nodeArgs, parentNode, interpreter) {
    let displayTokens = [];
    nodeArgs.forEach((arg, i) => {
      if (arg.type === 'Literal') {
        displayTokens[i] = {
          value: arg.value.toString(),
          type: isNaN(arg.value) ? 'string' : 'number',
        };
      } else if (arg.type === 'CallExpression') {
        displayTokens[i] = getInitialDisplayTokens(arg.callee.name, arg.arguments, parentNode, interpreter);
      } else if (arg.type === 'FunctionExpression') {
        // anonymous functions - don't show the full details
        displayTokens[i] = getInitialDisplayTokens('anonymous', arg.params, parentNode, interpreter);
      } else if (arg.type === 'Identifier') {
        // interpolate paramNames with passed arguments
        // at this point. Would have liked to do this
        // at the update step, but for functions
        // which return functions this information
        // needs to be present as soon as the returned function
        // appears in the visualizer.
        let stackLevel = 1;
        let stateStack = interpreter.stateStack;
        let callerPassingParams = stateStack[stackLevel].node;
        // params will only be passed from Program down
        if (parentNode) {
          let nodeContainingParams = parentNode;
          let matchedParamIndex = nodeContainingParams.paramNames.indexOf(arg.name);
          while (nodeContainingParams.parentNode !== null &&
            (!(matchedParamIndex > -1) ||
              callerPassingParams.type === 'CallExpression'
            )) {
            // check for nested CallExpressions in return:
            // will mean that param names don't come from immediate
            // parent but point above last CallExpression
            callerPassingParams = stateStack[++stackLevel].node;
            nodeContainingParams = nodeContainingParams.parentNode;
            matchedParamIndex = nodeContainingParams.paramNames.indexOf(arg.name);
          }
          if (matchedParamIndex > -1) {
            let parentTokens = nodeContainingParams.displayTokens;
            displayTokens[i] = parentTokens[matchedParamIndex + 1];
          } else {
            let value = interpreter.getScope().properties[arg.name];
            // must be rootScope - get type from interpreter.
            // or FunctionExpression - just pass through.
            let type = (value) ? value.type : 'code';
            displayTokens[i] = {
              value: arg.name,
              type,
            };
          }
        } else {
          throw new Error(`Wrapping root (Program) function shouldn't have arguments`);
        }
      } else if (arg.type === 'MemberExpression') {
        let objArray = [];
        let _ = arg;
        while (_.object) {
          objArray.push(_.object.name);
          _ = _.object;
        }
        displayTokens[i] = {
          value: arg.object.name,
          type: 'object',
          object: objArray,
          property: arg.property.name,
        };
      } else {
        // BinaryExpressions and more edge cases...just get the code
        // and the interpreter should provide an interpolated
        // replacement for this on the update pass.
        // console.log('just generating code for edge case of ' + arg.type + ' types');
        displayTokens[i] = {
          value: astTools.createCode(arg),
          type: 'code',
        };
      }
    });
    displayTokens.unshift({
      value: funcName,
      type: 'function',
    });
    return displayTokens;
  }

  function joinAndFormatDisplayTokens(tokens, recursion) {
    let newArgs = tokens.slice();
    let funcName = newArgs.shift();
    return formatSingleToken(funcName, recursion) + '(' + newArgs.map((arg) => {
      if (Array.isArray(arg)) {
        return joinAndFormatDisplayTokens(arg);
      }
      return formatSingleToken(arg);
    }).join(', ') + ')';
  }

  function formatSingleToken(token, recursion) {
    switch (token.type) {
      case 'undefined':
      case 'number':
      case 'code':
        return token.value;
      case 'string':
        return `"${token.value}"`;
      case 'object':
        return `{${token.value}}`;
      case 'function':
        return formatFunctionName(token, recursion);
      default:
        console.error('unknown token type encountered: ' + token.type);
    }
  }

  function formatFunctionName(token, recursion) {
    // don't show the body of the function, for brevity
     let preString = (recursion) ? '<i>(r)' : '<i>';

let functionName = 
     (token.value) ?
      `${preString} ${token.value}</i> ` :
      `${preString} anonymous</i> `;
    return functionName;
  }

  return {
    getInitialDisplayTokens,
    joinAndFormatDisplayTokens,
    formatSingleToken,
  };
}

export default new StringTokenizer();
