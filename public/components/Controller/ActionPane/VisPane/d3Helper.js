// ======================================================
// D3 functions
// D3 controls the VisPane React component contents
// uses the standard D3 initialize / update pattern
// ======================================================
import d3 from 'd3';
let cola = require('webcola');

function initialize(element, dimensions, nodes, links) {
  const width = dimensions[0] = element.clientWidth;
  const height = dimensions[1];

  // for the bounding box when dragging functions
  const inlay = 5;

  // cleanup if React udpates and doesn't re-mount DOM element
  d3.select(element).selectAll('*').remove();

  let svg = d3.select(element).append('svg')
    .attr('width', width)
    .attr('height', height);

  links = [{
    source: 0,
    target: 1,
  }, {
    source: 1,
    target: 2
  }];


  // const forceLayout = d3.layout.force();
  // colaJS improves and stabilises the d3 force layout graph
  const forceLayout = cola.d3adaptor();

  forceLayout.size([width, height])
    .nodes(nodes)
    .links(links)
    .linkDistance(200)
    // additional cola-only options
    .start(10, 15, 20);

  // allow for dragging of nodes to reposition functions
  let drag = forceLayout.drag()
    .on('dragstart', onDragNode);


  let node = svg.append('g').selectAll('.function-node');
  let link = svg.append('g').selectAll('.function-link');

  /* event listeners (lodged issue with WebCola:
  does not return all properties for functional piping from events */
  forceLayout.on('tick', forceTick);

  function update() {
    node = node.data(forceLayout.nodes());
    updateDrawFunctionBlocks(node, drag);

    link = link.data(forceLayout.links());
    updateDrawFunctionLinks(link);

    forceLayout.start();
  }

  function forceTick() {
    node.attr('transform', (d) => {
      d.x = Math.max(inlay, Math.min(width - inlay, d.x));
      d.y = Math.max(inlay, Math.min(height - inlay, d.y));
      return `translate(${d.x},${d.y})`;
    });
    link.attr('x1', function(d) {
        return d.source.x;
      })
      .attr('y1', function(d) {
        return d.source.y;
      })
      .attr('x2', function(d) {
        return d.target.x;
      })
      .attr('y2', function(d) {
        return d.target.y;
      });
  }

  update();
}

// ===========================================
// Helper functions for use by update function
// (Deliberately left after declaration for readability
// as they will be hoisted anyway)
// ===========================================

function updateDrawFunctionBlocks(node, drag) {
  const funcBlock = node.enter().append('g');

  funcBlock.append('rect')
    .attr('class', 'function-node')
    .attr('height', 200)
    .attr('width', 200)
    .attr('rx', 10)
    .attr('ry', 10);

  funcBlock.append('text')
    .attr('class', 'function-heading')
    .attr('x', 5)
    .attr('y', 20)
    .text(function(d) {
      return d.name;
    });

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
