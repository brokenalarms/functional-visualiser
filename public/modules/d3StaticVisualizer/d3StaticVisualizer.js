// ======================================================
// D3 functions
// D3 controls the VisPane React component contents
// uses the standard D3 initialize / update pattern
// except update occurs through SequencerStore emit event
// ======================================================
let d3 = require('d3');
//let cola = require('webcola');

let options = {
  graphType: 'd3',
  dimensions: {
    width: null,
    height: null,
  },
  d3Force: {
    charge: -800,
    chargeDistance: 500,
    gravity: 0.01,
  },
  layout: {
    globalScopeFixed: true,
  },
  funcBlock: {
    height: 200,
    width: 190,
    text: {
      lineHeight: 20,
    },
  },
  links: {
    display: 'call', // call, hierarchy, or both
    strength: function(d) {
      return 0.01;
    },
    distance: function(nodes) {
      return options.dimensions.width /
        Math.min(Math.max(nodes.length, 1), 15);
    },
  },
};

let svg, node, link, forceLayout, tooltip, drag;

function initialize(element, nodes, links, dimensions) {
  options.dimensions = dimensions;

  // take the global scope out and fix it in the top right to start
  if (options.layout.globalScopeFixed) {
    let globalScope = nodes[0];
    Object.assign(globalScope, {
      x: options.dimensions.width,
      y: 0,
      fixed: true,
    });
  }

  // cleanup if React udpates and doesn't re-mount DOM element
  d3.select(element).selectAll('*').remove();

  svg = d3.select(element).append('svg')
    .attr('class', 'd3-root')
    .attr('width', options.dimensions.width)
    .attr('height', options.dimensions.height);

  // save arrow SVG
  svg.append('svg:defs')
    .append('svg:marker')
    .attr('id', 'arrow')
    .attr('refX', 3)
    .attr('refY', 6)
    .attr('markerWidth', 20)
    .attr('markerHeight', 20)
    .attr('orient', 'auto')
    .style('fill', 'darkgray')
    .append('svg:path')
    .attr('d', 'M2,2 L2,11 L10,6 L2,2');

  tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  forceLayout = createNewForceLayout(options.graphType, nodes, links);
  // allow for dragging of nodes to reposition functions
  drag = forceLayout.drag()
    .on('dragstart', onDragStart);

  link = svg.selectAll('.function-link');
  node = svg.selectAll('.function-node');

  // for the bounding window when dragging functionBlocks
  const inlay = 0;
  const xBuffer = inlay + options.funcBlock.width / 2;
  const yBuffer = inlay + options.funcBlock.height / 2;
  const maxAllowedX = options.dimensions.width - options.funcBlock.width;
  const maxAllowedY = options.dimensions.height - options.funcBlock.height;
  forceLayout.on('tick', function() {
    link.attr('points', (d) => {
      let x1 = Math.max(xBuffer, Math.min(options.dimensions.width - xBuffer, d.source.x + xBuffer));
      let y1 = Math.max(yBuffer, Math.min(options.dimensions.height - yBuffer, d.source.y + yBuffer));
      let x2 = Math.max(xBuffer, Math.min(options.dimensions.width - xBuffer, d.target.x + xBuffer));
      let y2 = Math.max(yBuffer, Math.min(options.dimensions.height - yBuffer, d.target.y + yBuffer));
      let midX = (x1 + x2) / 2;
      let midY = (y1 + y2) / 2;
      return `${x1},${y1} ${midX},${midY} ${x2},${y2}`;
    });

    node.attr('transform', (d) => {
      d.x = Math.max(inlay, Math.min(maxAllowedX, d.x));
      d.y = Math.max(inlay, Math.min(maxAllowedY, d.y));
      return `translate(${d.x}, ${d.y})`;
    });
  });
}

function update() {
  node = node.data(forceLayout.nodes());
  link = link.data(forceLayout.links());
  link.enter().append('polyline');
  drawFunctionLink(link);
  node.enter().append('g')
    .on('dblclick', onDoubleclickNode);
  drawFunctionBlock(node, tooltip);
  node.exit().remove();
  node.call(drag);
}

function destroy(element) {
  if (forceLayout) {
    forceLayout.stop();
  }
  d3.select(element).selectAll('*').remove();
  svg = forceLayout = node = link = null;
}

// ===================
// Helper functions
// ===================

function createNewForceLayout(graphType, nodes, links) {
  let force;
  if (graphType === 'd3') {
    force = d3.layout.force();
  } else if (graphType === 'cola') {
    // colaJS improves and stabilises the d3 force layout graph
    force = cola.d3adaptor();
  }
  force.size([options.dimensions.width, options.dimensions.height])
    .nodes(nodes)
    .links(links)
    .linkDistance(options.links.distance.bind(this, nodes));

  if (graphType === 'd3') {
    force
      .charge(options.d3Force.charge)
      .gravity(options.d3Force.gravity)
      .linkStrength(options.links.strength)
      .chargeDistance(options.d3Force.chargeDistance)
      .start();
  } else if (graphType === 'cola') {
    force
      .avoidOverlaps(true)
      .start([10, 15, 20]);
  }
  return force;
}

function drawFunctionLink(link) {
  link
    .attr('class', 'function-link')
    .attr('marker-mid', 'url(#arrow)');
}

function drawFunctionBlock(funcBlock, tooltip) {
  funcBlock.append('rect')
    .attr('class', 'function-node')
    .attr('width', (d) => {
      return d.width || options.funcBlock.width;
    })
    .attr('height', (d) => {
      return d.height || options.funcBlock.height;
    })
    .attr('rx', 10)
    .attr('ry', 10);

  let addText = appendText(funcBlock, 10, 25);
  addText('function-name', 'id');
  let addHoverText = appendText(funcBlock, 160, 10, 170, 'rect');
  let toolTipArea = addHoverText('function-hover');
  addToolTip(toolTipArea, tooltip);
  addText('function-text', 'scope');
  addText('function-text', 'params');
  addText('function-heading', 'Variables declared:');
  addText('function-text', 'declarationsMade');
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
          let keyLookupText = d.scopeInfo[textOrKey];
          return (keyLookupText !== undefined) ? keyLookupText.toString() : textOrKey;
        });
      }

      y += options.funcBlock.text.lineHeight;
      return textBlock;
    };
  }
}

function addToolTip(area, tooltip) {
  area.on('mouseover', function(d) {
      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);
      tooltip.text(d.scopeInfo.codeString.split('\n'))
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 28 + 'px');
    })
    .on('mouseout', function(d) {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    });
}

function onDragStart(d) {
  d3.select(this).select('rect').classed('fixed', d.fixed = true);
  // prevents browser scrolling whilst dragging about node
  d3.event.sourceEvent.preventDefault();
}

function onDoubleclickNode(d) {
  d3.select(this).select('rect').classed('fixed', d.fixed = false);
}
export default {
  initialize, update, destroy,
};
