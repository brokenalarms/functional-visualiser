// TODO - extract options into d3OptionsStore
let options = {
  d3Force: {
    charge: -500,
    chargeDistance: 500,
    gravity: 0.05,
  },
  dimensions: {
    nodeRadius: 10,
    width: null,
    height: null,
  },
  links: {
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
// shared by externally available update function
let node, link, forceLayout;

function initialize(element, nodes, links, dimensions) {
  options.dimensions.width = dimensions.width;
  options.dimensions.height = dimensions.height;

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
  let force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([options.dimensions.width, options.dimensions.height])
    .linkDistance(options.links.distance.bind(this, nodes))
    .charge(options.d3Force.charge)
    .gravity(options.d3Force.gravity)
    .linkStrength(options.links.strength)
    .chargeDistance(options.d3Force.chargeDistance)
    .on('tick', tick);

  // for keeping nodes within the boundaries
  const inlay = options.dimensions.nodeRadius * 2;
  const maxAllowedX = options.dimensions.width - inlay;
  const maxAllowedY = options.dimensions.height - inlay;

  return force;

  function tick() {
    link.attr('points', (d) => {
      let midX = (d.source.x + d.target.x) / 2;
      let midY = (d.source.y + d.target.y) / 2;
      return `${d.source.x},${d.source.y} ${midX},${midY} ${d.target.x},${d.target.y}`;
    });

    node.attr('transform', (d) => {
      d.x = Math.max(inlay, Math.min(maxAllowedX, d.x));
      d.y = Math.max(inlay, Math.min(maxAllowedY, d.y));
      return `translate(${d.x},${d.y})`;
    });
  }
}

/* update function is externally available so
   that React can handle unsubscription of 
   event listeners calling it*/
function update() {
  link = link.data(forceLayout.links());
  node = node.data(forceLayout.nodes(), (d) => {
    // re-matches data to work with shifting rather than popping
    // to follow stack behaviour 
    return d.index;
  });

  link.enter()
    .append('polyline')
    .attr('class', 'function-link')
    .attr('marker-mid', 'url(#arrow)');

  let nodeGroup = node.enter().append('g');
  nodeGroup.append('circle').attr('class', 'function-node').attr('r', options.dimensions.nodeRadius);
  nodeGroup.append('text').text((d) => {
    return d.displayInfo.calleeName;
  });

  node.exit().remove();
  link.exit().remove();
  forceLayout.start();
}

export default {
  initialize, update,
};
