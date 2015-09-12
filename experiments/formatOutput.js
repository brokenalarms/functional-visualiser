import astTools from '../astTools/astTools.js';

function formatOutput() {

  function getArguments(node) {
    return astTools.getArgs(node);
  }

  function getArgIdentifiers(node) {
    let args = astTools.getArgs(node);
    if (args) {
      return args.map((arg) => {
        return astTools.getId(arg);
      });
    }
    return getDisplayArgs(node, null, astTools.getId);
  }

  function getDisplayArgs(node, raw) {
    let displayArgs = [];
    let args = astTools.getArgs(node);
    if (args) {
      args.forEach((arg, i) => {
        displayArgs[i] = formatAstIdentifier(arg, raw);
      });
    }
    return displayArgs;
  }

  function formatAstIdentifier(node, raw) {

    if (!node) {
      return raw;
    }
    switch (node.type) {
      case 'Literal':
        if (raw) {
          return node.value.toString();
        }
        return isNaN(node.value) ?
          `"${node.value}"` : node.value.toString();
      case 'Identifier':
        // question mark because identifier hasn't
        // been matched with object/function yet
        if (raw) {
          return node.name;
        }
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
      case 'ArrayExpression':
        return `[${(node.elements[0]) ?  node.elements[0].name + ', ...' : 'empty'}]`;
      default:
        return 'value';
        console.error('unrecognised astType for formatting');
    }
  }

  function formatFunctionName(node, identifierString) {
    // don't show the body of the function, for brevity
    let name = astTools.getId(node);
    let funcString = (name) ?
      `<i>${name}</i> ` :
      `<i>function</i> `;

    let displayArgs = identifierString || getDisplayArgs(node);
    funcString = funcString.concat('(' + displayArgs.join(', ') + ')');
    return funcString;
  }

  function formatInterpreterIdentifier(value, identifierString) {
    switch (value.type) {
      case 'undefined':
        return value.type;
      case 'number':
        return (identifierString !== undefined) ?
          identifierString.toString() : value.data.toString();
      case 'string':
        return `"${identifierString || value.data}"`;
      case 'object':
        return `{${identifierString || value.data}}`;
      case 'function':
        return formatAstIdentifier(value.node, identifierString);
      case 'direct':
        return identifierString;
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

    getArguments,
  };
}

export default formatOutput();
