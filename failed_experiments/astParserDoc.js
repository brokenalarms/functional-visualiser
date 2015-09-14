function originalCola() {
  var graph = {
    "nodes": [{
      "name": "a",
      "width": 60,
      "height": 40
    }, {
      "name": "b",
      "width": 60,
      "height": 40
    }, {
      "name": "c",
      "width": 60,
      "height": 40
    }, {
      "name": "d",
      "width": 60,
      "height": 40
    }, {
      "name": "e",
      "width": 60,
      "height": 40
    }],
    "links": [{
      "source": 0,
      "target": 1
    }, {
      "source": 1,
      "target": 2
    }, {
      "source": 2,
      "target": 0
    }, {
      "source": 2,
      "target": 3
    }]
  };

  nodes.forEach((node) => {
    Object.assign(node, {
      width: options.funcBlock.width,
      height: options.funcBlock.height,
    })
  });

  var links = linksObj.d3CallLinks
  var width = 960,
    height = 500;

  var color = d3.scale.category20();


  var svg = d3.select(element).append("svg")
    .attr("width", width)
    .attr("height", height);

  var cola = webCola.d3adaptor()
    .linkDistance(120)
    .avoidOverlaps(true)
    .size([width, height])

  .nodes(nodes)
    .links(links)
    .start();

  var link = svg.selectAll(".link")
    .data(links)
    .enter().append("line")
    .attr("class", "link");

  var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("rect")


  .attr("class", "node")
    .attr("width", function(d) {
      return d.width;
    })
    .attr("height", function(d) {
      return d.height;
    })
    .attr("rx", 5).attr("ry", 5)
    .style("fill", function(d) {
      return color(1);
    })
    .call(cola.drag);

  /*  var label = svg.selectAll(".label")
        .data(graph.nodes)
       .enter().append("text")
        .attr("class", "label")
        .text(function (d) { return d.name; })
        .call(cola.drag);*/

  /*        node.append("title")
              .text(function (d) { return d.name; });*/

  cola.on("tick", function() {
    link.attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });


    node.attr("x", function(d) {
        return d.x - d.width / 2;
      })
      .attr("y", function(d) {
        return d.y - d.height / 2;
      });
    /*
                label.attr("x", function (d) { return d.x; })
                     .attr("y", function (d) {
                         var h = this.getBBox().height;
                         return d.y + h/4;
                     });*/
  });










}

/* CODE USED FOR DOCUMENTING ONLY

   ==================================
   AST: stripped down/ augmented representations
   that I am interested in.
   These will be supplied to the CodePane.
   ================================== */

/* where a new function / scope is created
 (function scoping for this exercise only,
  not ES6 block scoping!) */

/* describes 'function foo () {}'
   note: 'arguments' are passed as an array to a function
   in a CallExpression,
   but in declarations they are stored as 'params'.
*/
const astFunctionDeclared = {
  'type': 'FunctionDeclaration',
  'id': {
    'type': 'Identifier',
    'name': 'foo',
  },
  'params': [],
};

// OR...

/* describes 'var foo = function(){}'
   anonymous functions are just the 'FunctionExpression' object
   with the 'id' set to null.
*/
const astFunctionAssignedToVariable = {
  'type': 'VariableDeclaration',
  'declarations': [{
    'type': 'VariableDeclarator',
    'id': {
      'type': 'Identifier',
      'name': 'foo',
    },
    'init': {
      'type': 'FunctionExpression',
      'id': {
        'type': 'Identifier',
        'name': 'foo',
      },
      'params': [],
    },
  }, ],
};

/* describes function call 'foo(bar, function(){})'
   with an anonymousFunction passed in as an argument */
const astFunctionCalled = {
  'type': 'ExpressionStatement',
  'expression': {
    'type': 'CallExpression',
    'callee': {
      'type': 'Identifier',
      'name': 'foo',
    },
    'arguments': [{
      'type': 'Identifier',
      'name': 'bar',
    }, {
      'type': 'FunctionExpression',
      'id': {
        'type': 'Identifier',
        'name': null,
      },
      'params': [],
      'defaults': [],
      'body': {
        'type': 'BlockStatement',
        'body': [],
      },
    }],
  },
};

/* describes 'reduce' called at end of foo.bar.reduce(a, b),
   that returns a+b.

   I am only interested in top-level 'property.name'
   under 'callee' - nested properties are recursively
   stored under 'object.property.object...etc.
   I have commented that part out.'
*/
const astFunctionCalledasMemberOfObject = {
  'type': 'ExpressionStatement',
  'expression': {
    'type': 'CallExpression',
    'callee': {
      'type': 'MemberExpression',
      /*        'object': {
                'type': 'MemberExpression',
                'object': {
                  'type': 'Identifier',
                  'name': 'foo',
                },
                'property': {
                  'type': 'Identifier',
                  'name': 'bar',
                },
              },*/
      'property': {
        'type': 'Identifier',
        'name': 'reduce',
      },
    },
    'arguments': [{
      'type': 'FunctionExpression',
      'id': null,
      'params': [{
        'type': 'Identifier',
        'name': 'a',
      }, {
        'type': 'Identifier',
        'name': 'b',
      }],
      'defaults': [],
      'body': {
        'type': 'BlockStatement',
        'body': [{
          'type': 'ReturnStatement',
          'argument': {
            'type': 'BinaryExpression',
            'operator': '+',
            'left': {
              'type': 'Identifier',
              'name': 'a',
            },
            'right': {
              'type': 'Identifier',
              'name': 'b',
            },
          },
        }],
      },
    }, {
      'type': 'Literal',
      'value': 0,
      'raw': '0',
    }],
  },
};

const astReturnStatement = {
  'type': 'ReturnStatement',
  'argument': {
    'type': 'Identifier',
    'name': 'foo',
  },
};

/* for each of these mutations,
if the VariableDeclaration did not occur within
the same scope, set a flag
and record a reference to the
object where the VariableDeclaration is made. */

const astVariableMutated = {
  'type': 'ExpressionStatement',
  'expression': {
    'type': 'AssignmentExpression',
    'operator': '+=',
    'left': {
      'type': 'Identifier',
      'name': 'sum',
    },
    'right': {
      'type': 'MemberExpression',
      'computed': true,
      'object': {
        'type': 'Identifier',
        'name': 'arrayToSum',
      },
      'property': {
        'type': 'Identifier',
        'name': 'i',
      },
    },
  },
};

// END CODE USE FOR DOCUMENTING ONLY
