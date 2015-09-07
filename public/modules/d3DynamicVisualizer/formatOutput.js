import astTools from '../astTools/astTools.js';

function formatOutput() {

  function getArgIdentifiers(node) {
    return getDisplayArgs(node, astTools.getId);
  }

  function getDisplayArgs(node, callback) {
    let displayArgs = [];
    let args = astTools.getArgs(node);
    if (args) {
      args.forEach((arg, i) => {
        if (typeof callback === 'function') {
          displayArgs[i] = callback(arg);
        } else {
          displayArgs[i] = formatAstIdentifier(arg);
        }
      });
    }
    return displayArgs;
  }

  function formatAstIdentifier(node) {

    switch (node.type) {
      case 'Literal':
        return isNaN(node.value) ?
          `"${node.value}"` : node.value.toString();
      case 'Identifier':
        // question mark because identifier hasn't
        // been matched with object/function yet
        return `${node.name}?`;
      case 'CallExpression':
      case 'FunctionDeclaration':
      case 'FunctionExpression':
        // put passed functions in italics
        return formatFunctionName(node);
      case 'MemberExpression':
      case 'BinaryExpression':
        // re-creating the code from the AST allows for display of nested objects
        // passed as references.
        return astTools.createCode(node);
      default:
        console.error('unrecognised astType for formatting');
    }
  }

  function formatFunctionName(node) {
    // don't show the body of the function, for brevity
    let name = astTools.getId(node);
    let funcString = (name) ?
      `<i>${name}</i> ` :
      `<i>function</i> `;

    let displayArgs = getDisplayArgs(node);
    funcString = funcString.concat('(' + displayArgs.join(', ') + ')');
    return funcString;
  }

  function formatInterpreterIdentifier(value, identifierString) {
    switch (value.type) {
      case 'undefined':
        return value.type;
      case 'number':
        return value.data.toString();
      case 'string':
        return `"${value.data}"`;
      case 'object':
        return `{${identifierString || value.data}}`;
      case 'function':
        return formatAstIdentifier(value.node);
      default:
        console.error('unknown parameter value type encountered: ' + value.type);
    }
  }

  function formatDisplayName(name, args, recursion) {
    let recursionString = (recursion) ? '<i>(r)</i> ' : '';

    let displayArgs = args;
    if (args.length > 1 && args.join().length > 50) {
      displayArgs = args.map((arg, i) => {
        if (i === 0) {
          return `<div>${recursionString}${name} (${arg},</div>`;
        }
        if (i < args.length - 1) {
          return `<div class="text-indent">${arg},</div>`;
        }
        return `<div class="text-indent">${arg} )</div>`;
      });
      return `<div class="function-text"> ${displayArgs.join('')} </div>`;
    }
    return recursionString + name + ' ( ' + displayArgs.join(', ') + ' )';
  }


  return {
    astIdentifier: formatAstIdentifier,
    interpreterIdentifier: formatInterpreterIdentifier,
    displayName: formatDisplayName,
    getArgIdentifiers,
    getDisplayArgs,
  };
}

export default formatOutput();
