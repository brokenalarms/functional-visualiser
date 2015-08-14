// ======================================================
// D3 functions
// D3 controls the VisPane React component contents
// uses the standard D3 initialize / update pattern
// ======================================================
import d3 from 'd3';
let cola = require('webcola');

// TODO - extract options into d3OptionsStore
let options = {
  graphType: 'd3',
  d3Force: {
    charge: -800,
    chargeDistance: 500,
    gravity: 0.01,
  },
  layout: {
    globalScopeFixed: true,
  },
  width: null,
  height: null,
  funcBlock: {
    height: 200,
    width: 195,
    text: {
      lineHeight: 20,
    },
  },
  links: {
    display: 'call', // call, hierarchy, or both
    showBuiltinCalls: false,
    strength: function(d) {
      return 0.01;
    },
    distance: function(nodeCount) {
      return options.width / Math.min(4, nodeCount - 1);
    },
  },
};

function initialize(element, nodes, linksObj, dimensions) {
  options.width = dimensions[0];
  options.height = dimensions[1];


  // TODO extract into codeOptionsStore =============
  nodes.forEach((node) => {
    Object.assign(node, {
      width: options.funcBlock.width,
      height: options.funcBlock.height,
    });
  });

  // take the global scope out and fix it in the top right to start
  if (options.layout.globalScopeFixed) {
    let builtins = nodes[0];
    Object.assign(builtins, {
      x: 0,
      y: 0,
      fixed: true,
    });
    let globalScope = nodes[1];
    Object.assign(globalScope, {
      x: options.width,
      y: 0,
      fixed: true,
    });
  }
  // TODO - extract this to codeOptionsStore to control from there
  let links = (() => {
    switch (options.links.display) {
      case 'call':
        return linksObj.d3CallLinks;
      case 'hierarchy':
        return linksObj.d3HierarchyLinks;
      case 'both':
        return linksObj.d3HierarchyLinks.concat(linksObj.d3CallLinks);
    }
  })();

  if (options.links.display === 'call' && !options.links.showBuiltinCalls) {
    links = links.filter((link) => {
      return link.target !== nodes[0];
    });
  }


  // end TODO =========================================

  // cleanup if React udpates and doesn't re-mount DOM element
  d3.select(element).selectAll('*').remove();

  let svg = d3.select(element).append('svg')
    .attr('class', 'd3-root')
    .attr('width', options.width)
    .attr('height', options.height);

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

  let forceLayout = createNewForceLayout(options.graphType, nodes, links);
  // allow for dragging of nodes to reposition functions
  let drag = forceLayout.drag()
    .on('dragstart', onDragStart);


  let link = svg.selectAll('.function-link')
    .data(links);
  let node = svg.selectAll('.function-node')
    .data(nodes);

  function update() {
    link.enter().append('polyline');
    drawFunctionLink(link);
    node.enter().append('g')
      .on('click', onClickNode)
      .on('dblclick', onDoubleclickNode)
    drawFunctionBlock(node);
    node.exit().remove();
    node.call(drag);
  }

  // for the bounding window when dragging functionBlocks
  const inlay = 0;
  const xBuffer = inlay + options.funcBlock.width / 2;
  const yBuffer = inlay + options.funcBlock.height / 2;
  const maxAllowedX = options.width - options.funcBlock.width;
  const maxAllowedY = options.height - options.funcBlock.height;
  forceLayout.on('tick', function() {
    link.attr('points', (d) => {
      let x1 = Math.max(xBuffer, Math.min(options.width - xBuffer, d.source.x + xBuffer));
      let y1 = Math.max(yBuffer, Math.min(options.height - yBuffer, d.source.y + yBuffer))
      let x2 = Math.max(xBuffer, Math.min(options.width - xBuffer, d.target.x + xBuffer));
      let y2 = Math.max(yBuffer, Math.min(options.height - yBuffer, d.target.y + yBuffer));
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
  update();
}

// ===================
// Helper functions
// ===================

function createNewForceLayout(graphType, nodes, links, constraints) {
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
    .linkDistance(options.links.distance.bind(this, nodes.length));

  if (graphType === 'd3') {
    forceLayout
      .charge(options.d3Force.charge)
      .gravity(options.d3Force.gravity)
      .linkStrength(options.links.strength)
      .chargeDistance(options.d3Force.chargeDistance)
      .start();
  } else if (graphType === 'cola') {
    forceLayout
      .avoidOverlaps(true)
      // .symmetricDiffLinkLengths(300)
      .start([10, 15, 20]);
  }
  return forceLayout;
}

function drawFunctionLink(link) {
  link
    .attr('class', 'function-link')
    .attr('marker-mid', 'url(#arrow)');
}

function drawFunctionBlock(funcBlock) {
  funcBlock.append('rect')
    .attr('class', 'function-node')
    .attr('width', (d) => {
      return d.width;
    })
    .attr('height', (d) => {
      return d.height;
    })
    .attr('rx', 10)
    .attr('ry', 10);

  let addText = appendText(funcBlock, 10, 25);
  addText('function-name', 'name');
  let addHoverText = appendText(funcBlock, 160, 10, 170, 'rect');
  addHoverText('function-hover');
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
}

function onClickNode(d) {}

function onDragStart(d) {
  d3.select(this).select('rect').classed('fixed', d.fixed = true);
  // prevents browser scrolling whilst dragging about node
  d3.event.sourceEvent.preventDefault();
}

function onDragEnd(d) {
  return;
}

function onDoubleclickNode(d) {
  d3.select(this).select('rect').classed('fixed', d.fixed = false);
}
export default initialize;
