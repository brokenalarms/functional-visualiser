// ======================================================
// D3 functions
// D3 controls the VisPane React component contents
// uses the standard D3 initialize / update pattern
// except update occurs through UpdateStore emit event
// ======================================================
import d3 from 'd3';
import UpdateStore from '../stores/UpdateStore.js';
import Sequencer from '../Sequencer/Sequencer.js';
let cola = require('webcola');

// TODO - extract options into d3OptionsStore
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
    globalScopeFixed: false,
  },
  funcBlock: {
    height: 20,
    width: 19,
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
      return options.dimensions.width / Math.min(4, nodeCount - 1);
    },
  },
};

function initialize(element, nodes, links, dimensions) {
  options.dimensions = dimensions;


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
      x: options.dimensions.width,
      y: 0,
      fixed: true,
    });
  }
  // TODO - extract this to codeOptionsStore to control from there
  /*  let links = (() => {
      switch (options.links.display) {
        case 'call':
          return linksObj.d3CallLinks;
        case 'hierarchy':
          return linksObj.d3HierarchyLinks;
        case 'both':
          return linksObj.d3HierarchyLinks.concat(linksObj.d3CallLinks);
      }
    })();*/

  if (options.links.display === 'call' && !options.links.showBuiltinCalls) {
    links = links.filter((link) => {
      return link.target !== nodes[0];
    });
  }
  // links = [];

  // end TODO =========================================

  // cleanup if React udpates and doesn't re-mount DOM element
  d3.select(element).selectAll('*').remove();

  let svg = d3.select(element).append('svg')
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

  let forceLayout = createNewForceLayout(options.graphType, nodes, links);
  // allow for dragging of nodes to reposition functions
  let drag = forceLayout.drag()
    .on('dragstart', onDragStart);


  let link = svg.selectAll('.function-link')
  let node = svg.selectAll('.function-node');

  function update(nodes, links) {
    node = node.data(nodes || []);
    link = link.data(links || []);
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
  const maxAllowedX = options.dimensions.width - options.funcBlock.width;
  const maxAllowedY = options.dimensions.height - options.funcBlock.height;
  forceLayout.on('tick', function() {
    /*    link.attr('points', (d) => {
          console.log(d);
          let x1 = Math.max(xBuffer, Math.min(options.dimensions.width - xBuffer, d.source.x + xBuffer));
          let y1 = Math.max(yBuffer, Math.min(options.dimensions.height - yBuffer, d.source.y + yBuffer))
          let x2 = Math.max(xBuffer, Math.min(options.dimensions.width - xBuffer, d.target.x + xBuffer));
          let y2 = Math.max(yBuffer, Math.min(options.dimensions.height - yBuffer, d.target.y + yBuffer));
          let midX = (x1 + x2) / 2;
          let midY = (y1 + y2) / 2;

          return `${x1},${y1} ${midX},${midY} ${x2},${y2}`;
        });*/

    node.attr('transform', (d) => {
      d.x = Math.max(inlay, Math.min(maxAllowedX, d.x || 0));
      d.y = Math.max(inlay, Math.min(maxAllowedY, d.y || 0));
      return `translate(${d.x}, ${d.y})`;
    });
  });

  /* start sequencer to drive CodePane and VisPane, and
     listen for updates
     the event listener will be destroyed when React updates. */
  UpdateStore.subscribeListener(function(newState) {
    update(newState);
  });
  let sequencer = new Sequencer().start();
}

// ===================
// Helper functions
// ===================

function createNewForceLayout(graphType, nodes, links) {
  let forceLayout;
  if (graphType === 'd3') {
    forceLayout = d3.layout.force();
  } else if (graphType === 'cola') {
    // colaJS improves and stabilises the d3 force layout graph
    forceLayout = cola.d3adaptor();
  }
  forceLayout.size([options.dimensions.width, options.dimensions.height])
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

  /*  let addText = appendText(funcBlock, 10, 25);
    addText('function-name', 'id');
    let addHoverText = appendText(funcBlock, 160, 10, 170, 'rect');
    addHoverText('function-hover');
    addText('function-text', 'params');
    addText('function-heading', 'Variables declared:');
    addText('function-text', 'declarationsMade');
    addText('function-heading', 'Variables mutated:');
    addText('function-text', 'variablesMutated');
    addText('function-heading', 'Functions called:');
    addText('function-text', 'functionsCalled');*/

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
