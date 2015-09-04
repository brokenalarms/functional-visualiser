// TODO - extract options into d3OptionsStore
let options = {
  rootPositionFixed: true,
  d3Force: {
    charge: -300,
    chargeDistance: 1000,
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
      return (Math.max(options.dimensions.width / ((nodes.length + 1) / 1.5), 90));
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
let svg, node, nodeText, link, forceLayout, drag;

function initialize(element, nodes, links, dimensions) {
  options.dimensions.width = dimensions.width;
  options.dimensions.height = dimensions.height;


  // cleanup if React udpates and doesn't re-mount DOM element
  d3.select(element).selectAll('*').remove();

  svg = d3.select(element).append('svg')
    .attr('class', 'd3-root')
    .attr('width', options.dimensions.width)
    .attr('height', options.dimensions.height);
  appendArrow();

  link = svg.append('g').selectAll('link');
  node = svg.append('g').selectAll('node');
  forceLayout = createNewForceLayout(options.graphType, nodes, links);
  drag = forceLayout.drag()
    .on('dragstart', onDragStart);
}

function appendArrow() {
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
    .links(links)
    .nodes(nodes)
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
      let arrowX = (d.source.x + d.target.x) / 2;
      let arrowY = (d.source.y + d.target.y) / 2;
      return `${d.source.x},${d.source.y} ${arrowX},${arrowY} ${d.target.x},${d.target.y}`;
    });

    node.attr('transform', (d) => {
      d.x = Math.max(inlay, Math.min(maxAllowedX, d.x));
      d.y = Math.max(inlay, Math.min(maxAllowedY, d.y));
      return `translate(${d.x},${d.y})`;
    });
    nodeText.attr('transform', (d) => {
      return `translate(${15},${-18})`;
    });
  }
}

/* update function is externally available so
   that React can handle unsubscription of 
   event listeners calling it*/
let firstRun = true;

function update() {


  link = link.data(forceLayout.links(), (d) => {
    return d.index;
  });
  node = node.data(forceLayout.nodes(), (d) => {
    // re-matches data to work with shifting rather than popping
    // to follow stack behaviour 
    return d.index;
  });

  link.enter()
    .append('polyline')
    .attr('class', (d) => {
      return 'link-' + d.linkState;
    })
    .attr('marker-mid', (d) => {
      if (d.linkState === 'broken') {
        return null;
      }
      return 'url(#arrow)';
    });
  link.exit().remove();

  let nodeGroup = node.enter().append('g')
    .on('dblclick', onDoubleclickNode)
    .call(drag);

  nodeGroup.append('circle')
    .attr('r', options.dimensions.nodeRadius);



  nodeText = nodeGroup.append('foreignObject')
    .attr('class', 'unselectable function-text');

  node.selectAll('foreignObject').html((d) => {
    return '<div class="pointer unselectable"}>' +
      d.info.displayName + '</div>';
  });

  node.selectAll('circle')
    .attr('class', (d) => {
      return d.info.className + ' pointer';
    });

  node.exit().remove();
  forceLayout.start();
}

function onDragStart(d) {
  d3.select(this).select('circle').classed('function-fixed', d.fixed = true);
  // prevents browser scrolling whilst dragging about node
  d3.event.sourceEvent.preventDefault();
}

function onDoubleclickNode(d) {
  d3.select(this).select('circle').classed('function-fixed', d.fixed = false);
}

function destroy() {
  // probably not necessary if React resets components
  forceLayout.stop();
  svg.selectAll('*').remove();
  svg = forceLayout = node = link = null;
}

export default {
  initialize, update, destroy,
};
