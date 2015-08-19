// async recursion - no good as I need every recursion to 
// return before the next
function asyncRecursion(codeToParse) {
  var nodes = [{
    val: 1,
  }, {
    val: 2,
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
        val: 'nested2',
      }, ],
    }, ],
  }, {
    val: 5
  }];
  var stepOrder = [];

  var shouldHave = [1, '1ar', 2, '2ar', 'outsideNested1',
    'nested1', 'nested1.1', 'nested1.1ar', 'nested1ar',
    'outsideNested1ar', 'outsideNested2', 'nested2', 'nested2ar',
    'outsideNested2ar', 5
  ]

  function executeSteps(node, callback) {


    node.forEach((step) => {
      if (step.val) {
        stepOrder.push(step.val);
      }
      if (step.nested) {
        executeSteps(step.nested);
      }
      /*      if (callback) {*/
      /*        callback(step)*/
      /*      }*/
      stepOrder.push(step.val + 'ar');
    })

  }

  executeSteps(nodes);
  console.log(stepOrder);
  /* = [1, "1ar", 2, "2ar", "outsideNested1", "nested1", "nested1.1", "nested1.1ar", "nested1ar", "outsideNested2", "nested2", "nested2ar", "outsideNested2ar", "outsideNested1ar", 5, "5ar"]*/
}

function syncRecursion(codeToParse) {
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

  function executeSteps(node, callback) {
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
  console.log(stepOrder);


}
