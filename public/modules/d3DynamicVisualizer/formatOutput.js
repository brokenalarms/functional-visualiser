import astTools from '../astTools/astTools.js';

function formatOutput() {

  function formatFunctionName(nameLoc, paramsLoc) {
    // don't show thie body of the function, for brevity
    let funcString = (nameLoc) ?
      `<i>${nameLoc}</i> ` :
      `<i>function</i> `;
    if (paramsLoc.length > 0) {
      let paramArray = [];
      paramsLoc.forEach((param) => {
        paramArray.push(formatAstIdentifier(param));
      });
      funcString = funcString.concat('(' + paramArray.join(', ') + ')');
    }
    return funcString;
  }

function formatAstIdentifier(argument) {

  switch (argument.type) {
    case 'Literal':
      return isNaN(argument.value) ?
        `"${argument.value}"` : argument.value.toString();
    case 'Identifier':
      // question mark because identifier hasn't
      // been matched with object/function yet
      return `${argument.name}?`;
    case 'CallExpression':
      // put passed functions in italics
      return formatFunctionName(argument.callee.name, argument.arguments);
    case 'FunctionDeclaration':
      return formatFunctionName(argument.id.name, argument.params);
    case 'FunctionExpression':
      return formatFunctionName(argument.id, argument.params);
    case 'MemberExpression':
    case 'BinaryExpression':
      // re-creating the code from the AST allows for display of nested objects
      // passed as references.
      return astTools.createCode(argument);
    default:
      console.error('unrecognised astType for formatting');
  }
}

function formatInterpreterIdentifier(value, currentDisplayArg) {
  switch (value.type) {
    case 'undefined':
      return value.type;
    case 'number':
      return value.data.toString();
    case 'string':
      return `"${value.data}"`;
    case 'object':
      return `{${(currentDisplayArg.charAt(currentDisplayArg.length - 1) === '?') ? 
        currentDisplayArg.slice(0, -1) : currentDisplayArg}}`;
    case 'function':
      return formatAstIdentifier(value.node);
    default:
      console.error('unknown parameter value type encountered: ' + value.type);
  }
}

function formatDisplayName(name, args) {
  let displayArgs = args;
  if (args.length > 1 && args.join().length > 50) {
    displayArgs = args.map((arg, i) => {
      if (i === 0) {
        return `<div>${name} (${arg},</div>`;
      }
      if (i < args.length - 1) {
        return `<div class="text-indent">${arg},</div>`;
      }
      return `<div class="text-indent">${arg} )</div>`;
    });
    return `<div class="function-text"> ${displayArgs.join('')} </div>`;
  }
  return name + ' ( ' + displayArgs.join(', ') + ' )';
}


return {
  astIdentifier: formatAstIdentifier,
  interpreterIdentifier: formatInterpreterIdentifier,
  displayName: formatDisplayName,
};
}

export default formatOutput();
