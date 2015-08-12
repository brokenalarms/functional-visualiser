// ======================================================
// D3 functions
// D3 controls the VisPane React component contents
// uses the standard D3 initialize / update pattern
// ======================================================
import d3 from 'd3';
let cola = require('webcola');

/* it would be better if I could take these variables from a CSS class,
   but D3 doesn't seem to allow this. */
let options = {
  graphType: 'cola',
  width: null,
  height: null,
  funcBlock: {
    height: 200,
    width: 200,
    text: {
      lineHeight: 20,
    },
  },
  links: {
    distance: 300,
  },
};

function initialize(element, nodes, links, dimensions) {
  options.width = dimensions[0];
  options.height = dimensions[1];

  // for the bounding box when dragging functions
  const inlay = 5;

  // cleanup if React udpates and doesn't re-mount DOM element
  d3.select(element).selectAll('*').remove();

  let svg = d3.select(element).append('svg')
    .attr('class', 'd3-root')
    .attr('width', options.width)
    .attr('height', options.height);

  // TODO links don't work
  links = [{
    source: 0,
    target: 1,
  }, {
    source: 1,
    target: 2
  }];
  const forceLayout = createNewForceLayout(options.graphType, nodes, links);

  /* event listeners (lodged issue with WebCola:
  does not return all properties for functional piping from events */
  forceLayout.on('tick', forceTick);
  // allow for dragging of nodes to reposition functions
  let drag = forceLayout.drag()
    .on('dragstart', onDragNode);

  let node = svg.append('g').selectAll('.function-node');
  let link = svg.append('g').selectAll('.function-link');

  function forceTick() {
    node.attr('transform', (d) => {
      d.x = Math.max(inlay, Math.min(options.width - options.funcBlock.width, d.x));
      d.y = Math.max(inlay, Math.min(options.height - options.funcBlock.height, d.y));
      return `translate(${d.x},${d.y})`;
    });
    link.attr('x1', (d) => {
        return d.source.x;
      })
      .attr('y1', (d) => {
        return d.source.y;
      })
      .attr('x2', (d) => {
        return d.target.x;
      })
      .attr('y2', (d) => {
        return d.target.y;
      });
  }

  function update() {
    node = node.data(forceLayout.nodes());
    updateDrawFunctionBlocks(node, drag);

    link = link.data(forceLayout.links());
    updateDrawFunctionLinks(link);

    forceLayout.start();
  }
  update();
}


// ===========================================
// Helper functions for use by update function
// (Deliberately left after declaration for readability
// as they will be hoisted anyway)
// ===========================================

function createNewForceLayout(graphType, nodes, links) {
  let forceLayout;
  if (graphType === 'd3') {
    forceLayout = d3.layout.force();
  } else if (graphType === 'cola') {
    // colaJS improves and stabilises the d3 force layout graph
    forceLayout = cola.d3adaptor();
  } else {
    throw new Error('unrecognised graphType in graphType parameter');
  }
  forceLayout.size([options.width, options.height])
    .nodes(nodes)
    .links(links)
    .linkDistance(options.width / 3.5);

  if (graphType === 'd3') {
    forceLayout
      .charge(-10)
      .gravity(0.000);
  } else if (graphType === 'cola') {
    forceLayout
      .avoidOverlaps(true)
      .start(10, 15, 20);
  }
  return forceLayout;
}

function updateDrawFunctionBlocks(node, drag) {
  const funcBlock = node.enter().append('g');

  funcBlock.append('rect')
    .attr('class', 'function-node')
    .attr('height', options.funcBlock.height)
    .attr('width', options.funcBlock.width)
    .attr('rx', 10)
    .attr('ry', 10);

  /*  funcBlock.append('text')
      .attr('class', 'function-heading')
      .attr('x', 5)
      .attr('y', 20)
      .text(function(d) {
        return d.name;
      });*/
  let addText = appendText(funcBlock, 10, 25);
  addText('function-name', 'functionName');
  let hoverText = appendText(funcBlock, 170, 10, 180, 'rect');
  hoverText('function-hover');
  addText('function-text', 'params');
  addText('function-heading', 'Variables declared:');
  addText('function-text', 'variablesDeclared');
  addText('function-heading', 'Variables mutated:');
  addText('function-text', 'variablesMutated');
  addText('function-heading', 'Functions called:');
  addText('function-text', 'functionsCalled');

  function appendText(block, ...other) {
    let textBlock = block;
    let [x, y, dx, element] = other;
    element = element ? element : 'text';

    return function(className, textOrKey) {
      textBlock = funcBlock.append(element)
        .attr('class', className)
        .attr('x', x)
        .attr('y', y);

      if (dx) {
        textBlock
          .attr('dx', dx)
          .style('text-anchor', 'end');
      }
      if (element === 'text') {
        textBlock.text((d) => {
          let keyLookupText = d.displayText[textOrKey];
          return (keyLookupText !== undefined) ? keyLookupText : textOrKey;
        });
      }

      y += options.funcBlock.text.lineHeight;
    };
  }
  // set up event listeners for interactivity
  funcBlock
    .on('click', onClickNode)
    .call(drag);

  node.exit().remove();
}

function updateDrawFunctionLinks(link) {
  link.enter().append('line')
    .attr('class', 'function-link');
}

function onClickNode() {
  console.log('functionBlock clicked');
}

function onDragNode() {

}

export default initialize;
