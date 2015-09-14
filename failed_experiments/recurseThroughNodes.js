  var nodes = [{
    val: 1
  }, {
    val: 2
  }, {
    val: 'outsideNested1',
    nested: [{
      val: 'nested1',
      nested: [{
        val: 'nested1.1'
      }],
    }, {
      val: 'outsideNested2',
      nested: [{
        val: 'nested2'
      }, ]
    }, ]
  }, {
    val: 3
  }];
  var stepOrder = [];

  var shouldHave = [1, '1ar', 2, '2ar', 'outsideNested1',
    'nested1', 'nested1.1', 'nested1.1ar', 'nested1ar',
    'outsideNested2', 'nested2', 'nested2ar',
    'outsideNested2ar', 'outsideNested1ar', 5,
  ];

  /*  function executeSteps(node, callback) {
      if (node.val) {
        console.log(node.val)
        stepOrder.push(node.val);
      }
      if (node.nested) {
        var j = 0;
        recurseThroughNodes(node.nested, j, recurseThroughNodes.bind(this, node, ++j, callback));
      }
      stepOrder.push(node.val + 'ar');

      if (callback) {
        callback();
      }
    }

    var index = 0;
    function recurseThroughNodes(node, index, callback) {

      if (index < node.length) {
        executeSteps(node[index], recurseThroughNodes.bind(this, node, ++index, callback))
      } else {
        console.log('finished level beginning with' + node[0].val);
      }
    }
    recurseThroughNodes(nodes, index);
    console.log(stepOrder);*/

  var ast = [{
    "type": "FunctionDeclaration",
    "id": {
      "type": "Identifier",
      "name": "sumFunction"
    },
    "params": [{
      "type": "Identifier",
      "name": "arrayToSum"
    }],
    "defaults": [],
    "body": {
      "type": "BlockStatement",
      "body": [{
        "type": "ReturnStatement",
        "argument": {
          "type": "CallExpression",
          "callee": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": "arrayToSum"
            },
            "property": {
              "type": "Identifier",
              "name": "reduce"
            }
          },
          "arguments": [{
            "type": "FunctionExpression",
            "id": null,
            "params": [{
              "type": "Identifier",
              "name": "a"
            }, {
              "type": "Identifier",
              "name": "b"
            }],
            "defaults": [],
            "body": {
              "type": "BlockStatement",
              "body": [{
                "type": "ReturnStatement",
                "argument": {
                  "type": "BinaryExpression",
                  "operator": "+",
                  "left": {
                    "type": "Identifier",
                    "name": "a"
                  },
                  "right": {
                    "type": "Identifier",
                    "name": "b"
                  }
                }
              }]
            },
            "generator": false,
            "expression": false
          }, {
            "type": "Literal",
            "value": 0,
            "raw": "0"
          }]
        }
      }]
    },
    "generator": false,
    "expression": false
  }, {
    "type": "ExpressionStatement",
    "expression": {
      "type": "CallExpression",
      "callee": {
        "type": "Identifier",
        "name": "sumFunction"
      },
      "arguments": [{
        "type": "ArrayExpression",
        "elements": [{
          "type": "Literal",
          "value": 1,
          "raw": "1"
        }, {
          "type": "Literal",
          "value": 1,
          "raw": "1"
        }]
      }]
    }
  }]

  var nodes = {
    "type": "Program",
    "body": [{
      "type": "FunctionDeclaration",
      "id": {
        "type": "Identifier",
        "name": "foo"
      },
      "params": [],
      "defaults": [],
      "body": {
        "type": "BlockStatement",
        "body": [{
          "type": "FunctionDeclaration",
          "id": {
            "type": "Identifier",
            "name": "bar"
          },
          "params": [],
          "defaults": [],
          "body": {
            "type": "BlockStatement",
            "body": [{
              "type": "FunctionDeclaration",
              "id": {
                "type": "Identifier",
                "name": "baz"
              },
              "params": [],
              "defaults": [],
              "body": {
                "type": "BlockStatement",
                "body": [{
                  "type": "ReturnStatement",
                  "argument": {
                    "type": "Literal",
                    "value": "result",
                    "raw": "'result'"
                  }
                }]
              },
              "generator": false,
              "expression": false
            }, {
              "type": "ReturnStatement",
              "argument": {
                "type": "CallExpression",
                "callee": {
                  "type": "Identifier",
                  "name": "baz"
                },
                "arguments": []
              }
            }]
          },
          "generator": false,
          "expression": false
        }, {
          "type": "ReturnStatement",
          "argument": {
            "type": "CallExpression",
            "callee": {
              "type": "Identifier",
              "name": "bar"
            },
            "arguments": []
          }
        }]
      },
      "generator": false,
      "expression": false
    }, {
      "type": "VariableDeclaration",
      "declarations": [{
        "type": "VariableDeclarator",
        "id": {
          "type": "Identifier",
          "name": "result"
        },
        "init": {
          "type": "CallExpression",
          "callee": {
            "type": "Identifier",
            "name": "foo"
          },
          "arguments": []
        }
      }],
      "kind": "var"
    }]
  }

  stepOrder = [];

  function executeSteps(node, callback) {
/*    var result;
    stepOrder.push(node);*/

    if (node.type === 'VariableDeclaration') {
      var j = 0;
      recurseThroughNodes(node.nested, j, recurseThroughNodes.bind(this, node, ++j, callback));
    }
    if (callback) {
      callback(result);
    } else {
      console.log('at top level and finished all recursion')
    }
  }

  var index = 0;

  function recurseThroughNodes(node, index, callback) {

    if (index < node.length) {
      executeSteps(node[index], function(result) {
        recurseThroughNodes(node, ++index, callback);
      });
    } else {
      console.log('finished level beginning with' + node[0].val);
    }
  }
  recurseThroughNodes(nodes.body, index);
  console.log(stepOrder);


//===========================================
// TRY AGAIN
// ==========================================


function executeStep(step, node, callback) {

  let result = null;
  let currentStep = cloneDeep(step).value();
  let nodeState = cloneDeep(node).value();
  let state = {
    step: currentStep,
    state: nodeState,
  };
  stateArray.push(state);

  function gotoNextScope(callbackOnReturnToThisScope) {
    // use helper pointers gained from the static node traversal
    //   to get location of the next function
    let functionCalled = node.scopeInfo.functionsCalled.shift();
    console.log('entering new called function ' + functionCalled.name);
    stepIterator(functionCalled.callee, 0, callbackOnReturnToThisScope);
  }


  if (step.type === 'VariableDeclaration') {

    estraverse.traverse(step, {
      enter: function(child, parent) {
        if (child.type === 'CallExpression') {
          gotoNextScope(function(returnResult) {
            if (returnResult) {
              console.log('received return' + JSON.stringify(returnResult));
            }
            callback(returnResult);
          });
          this.break();
        }
      },
    });
  } else {
    // we're not changing scopes, just go to next step in this scope
    callback(result);
  }

}

/* switch (step.type) {
  case 'VariableDeclaration':
    stepVariableDeclation();
    break;
  case 'ReturnStatement':
    stepReturnStatement();
    break;
  default:
    //  console.log('no action currently for ' + step.type);
}


// callback stepIterator so it can call the next step in the scope

function stepReturnStatement() {
  result = step;
  if (step.argument.callee) {
    // resultArr.push(step.argument.callee);
    gotoNextScope(function(returnResult) {
      console.log(returnResult.argument.value + ' received in stepReturnStatement');
    });
  } else {
    resultArr.push(result);
  }
}
*/


function stepIterator(node, index, callback) {
  let steps;
  let result;
  estraverse.traverse(node, {
    enter: function(child) {
      if (child.type === 'BlockStatement') {
        steps = child.body;
        this.break();
      }
    },
  });

  if (index < steps.length) {
    executeStep(steps[index], node, function(returnResult) {
      if (returnResult) {
        result = returnResult;
      } if (callback){
        callback(result)
      }
      stepIterator(node, ++index, callback);
    });
  } else {
    /* finished all the steps in this scope:
     callback to the higher scope
    */
    if (callback) {
      callback(result);
    }
  }
}


// ==============================
// TRY with promises....
// function executeStep(step, node, resolve) {

  let currentStep = cloneDeep(step).value();
  let nodeState = cloneDeep(node).value();
  let state = {
    step: currentStep,
    state: nodeState,
  };
  console.log(blah++)
  resolve(state);
}

function nodeIterator(functionNode, i) {
  let [scope, steps] = astTools.getNodeAndStepsForFunction(functionNode);
//  let stepReturned = new Promise();
  if (i < steps.length) {
    stepReturned = new Promise((resolve) => {
      executeStep(steps[i], scope, resolve);
    });
    stepReturned.then((newState) => {
      console.log(newState);
      stateArray.push(newState);
      nodeIterator(scope, ++i);
    });
  } else {
    // finished with this scope -
    // last result returned should have been ReturnStatement
  }
}


let nodeIterator(ast, 0).then((result) => {
  console.log(stateArray);
});
