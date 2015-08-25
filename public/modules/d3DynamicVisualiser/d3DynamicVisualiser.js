// TODO - extract options into d3OptionsStore
let options = {
  graphType: 'd3',
  d3Force: {
    charge: -500,
    chargeDistance: 500,
    gravity: 0.05,
  },
  layout: {
    globalScopeFixed: false,
  },
  dimensions: {
    width: null,
    height: null,
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
    showBuiltinCalls: false,
    strength: function(d) {
      return 0.8;
    },
    distance: function(nodes) {
      return options.dimensions.width /
        Math.min(Math.max(nodes.length, 1), 15);
    },
  },
};

// ======================================================
// D3 functions
// uses the standard D3 initialize / update pattern
// except update occurs through externally subscribed 
// SequencerStore emit event.
// ======================================================
import d3 from 'd3';

let cola = require('webcola');
// shared by externally available update function
let node, link, forceLayout;

function initialize(element, nodes, links, dimensions) {
  options.dimensions = dimensions;

  // cleanup if React udpates and doesn't re-mount DOM element
  d3.select(element).selectAll('*').remove();

  let svg = d3.select(element).append('svg')
    .attr('class', 'd3-root')
    .attr('width', options.dimensions.width)
    .attr('height', options.dimensions.height);
  appendArrow(svg);

  link = svg.selectAll('.link');
  node = svg.selectAll('.node');
  forceLayout = createNewForceLayout(options.graphType, nodes, links);
}

function appendArrow(svg) {
  // add arrow reference for link paths
  svg.append('svg:defs')
    .append('svg:marker')
    .attr('id', 'arrow')
    .attr('refX', 3)
    .attr('refY', 6)
    .attr('markerWidth', 10)
    .attr('markerHeight', 10)
    .attr('orient', 'auto')
    .style('fill', 'darkgray')
    .append('svg:path')
    .attr('d', 'M2,2 L2,11 L10,6 L2,2');
}

function createNewForceLayout(graphType, nodes, links) {
  let force;
  if (graphType === 'd3') {
    force = d3.layout.force();
  } else if (graphType === 'cola') {
    /* colaJS improves and stabilises the d3 force layout graph
       for static layout */
    force = cola.d3adaptor();
  }
  force
    .nodes(nodes)
    .links(links)
    .size([options.dimensions.width, options.dimensions.height])
    .linkDistance(options.links.distance.bind(this, nodes))
    .on('tick', tick);

  if (graphType === 'd3') {
    force
      .charge(options.d3Force.charge)
      .gravity(options.d3Force.gravity)
      .linkStrength(options.links.strength)
      .chargeDistance(options.d3Force.chargeDistance);
  } else if (graphType === 'cola') {
    force.avoidOverlaps(true);
  }

  // for keeping nodes within the boundaries
  const inlay = 0;
  const xBuffer = inlay + options.funcBlock.width / 2;
  const yBuffer = inlay + options.funcBlock.height / 2;
  const maxAllowedX = options.dimensions.width - options.funcBlock.width;
  const maxAllowedY = options.dimensions.height - options.funcBlock.height;

  function tick() {

    link.attr('points', (d) => {
      let x1 = d.source.x;
      let y1 = d.source.y;
      let x2 = d.target.x;
      let y2 = d.target.y;

      let midX = (x1 + x2) / 2;
      let midY = (y1 + y2) / 2;

      return `${x1},${y1} ${midX},${midY} ${x2},${y2}`;
    });

    /*    link.attr('x1', function(d) {
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
          });*/
    node.attr('transform', (d) => {
      d.x = Math.max(inlay, Math.min(maxAllowedX, d.x));
      d.y = Math.max(inlay, Math.min(maxAllowedY, d.y));
      return `translate(${d.x},${d.y})`;
    });
  }

  return force;
}

/* update function is externally available so
   that React can handle unsubscription of 
   event listeners calling it*/
function update() {
  node = node.data(forceLayout.nodes(), (d) => {
    // re-matches data to work with shifting rather than popping
    // to follow stack behaviour 
    return d.index;
  });
  link = link.data(forceLayout.links());
  link.enter()
    .append('polyline')
    .attr('class', 'function-link')
    .attr('marker-mid', 'url(#arrow)');
  link.exit().remove();

  let nodeGroup = node.enter().append('g');
  nodeGroup.append('circle').attr('class', 'function-node').attr('r', 8);
  nodeGroup.append('text').text((d) => {
    return d.d3Info.name;
  });
  node.exit().remove();

  forceLayout.start();
}

export default {
  initialize, update,
};
