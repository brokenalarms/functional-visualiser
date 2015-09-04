// TODO - extract options into d3OptionsStore
let options = {
    rootPositionFixed: true,
    d3Force: {
      tuningFactor: (nodes) => {
        return Math.sqrt(nodes.length / (options.dimensions.width * options.dimensions.height));
      },
      charge: -600,
      chargeDistance: 300,
      gravity: 0.03,
      gravityFunc: (nodes) => {
        return 100 * tuningFactor(nodes);
    },
  },
  cssVars: {
    colorPrimary: '#2196F3',
    colorSecondary: '#4CAF50',
  },
  dimensions: {
    radius: {
      node: 10,
      rootFactor: 1.5,
      failureFactor: 1.3,
      finishedFactor: 4,
    },
    labelBuffer: 100,
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
  appendArrows();

  link = svg.append('g').selectAll('link');
  node = svg.append('g').selectAll('node');
  forceLayout = createNewForceLayout(options.graphType, nodes, links);
  drag = forceLayout.drag()
    .on('dragstart', onDragStart);
}

function appendArrows() {
  // add arrow reference for link paths
  [
    ['arrow-calling', options.cssVars.colorPrimary],
    ['arrow-returning', options.cssVars.colorSecondary],
  ].forEach((arrow) => {
    svg.append('svg:defs')
      .append('svg:marker')
      .attr('id', arrow[0])
      .attr('refX', 20)
      .attr('refY', 10)
      .attr('markerWidth', 30)
      .attr('markerHeight', 30)
      .attr('orient', 'auto')
      .style('fill', arrow[1])
      .append('svg:path')
      .attr('d', 'M0,0 L0,20 L20,10 L0,0');
  });
}

function createNewForceLayout(graphType, nodes, links) {
  let force = d3.layout.force()
    .links(links)
    .nodes(nodes)
    .size([options.dimensions.width, options.dimensions.height])
    .linkDistance(options.links.distance.bind(this, nodes))
    .charge(options.d3Force.charge)
    .friction(0.5)
    .gravity(options.d3Force.gravity)
    .linkStrength(options.links.strength)
    .chargeDistance(options.d3Force.chargeDistance)
    .on('tick', tick);

  // for keeping nodes within the boundaries
  const inlay = options.dimensions.radius.node * 2;
  const maxAllowedX = options.dimensions.width - inlay;
  const maxAllowedY = options.dimensions.height - inlay;

  return force;

  function tick() {
    link.attr('x1', function(d) {
        return getBoundingX(d.source.x);
      })
      .attr('y1', function(d) {
        return getBoundingY(d.source.y);
      })
      .attr('x2', function(d) {
        return getBoundingX(getTargetIntersection(d.source, d.target).x);
      })
      .attr('y2', function(d) {
        return getBoundingY(getTargetIntersection(d.source, d.target).y);
      });

    function getBoundingX(x) {
      return Math.max(inlay, Math.min(maxAllowedX - options.dimensions.labelBuffer, x));
    }

    function getBoundingY(y) {
      return Math.max(inlay, Math.min(maxAllowedY, y));
    }

    node.attr('transform', (d) => {
      d.x = getBoundingX(d.x);
      d.y = getBoundingY(d.y);
      return `translate(${d.x},${d.y})`;
    });
    nodeText.attr('transform', (d) => {
      return `translate(${d.radius * (options.dimensions.radius[d.status + 'Factor'] || 1) + 10},${-(d.radius * (options.dimensions.radius[d.status + 'Factor'] || 1) + 10)})`;
    });
  }
}

function getTargetIntersection(start, target) {
  // NOTE: This particular function to calculate the distance of the line
  // to the edge of the radius, rather than the center point of the node, 
  // is taken from this source:
  // http://stackoverflow.com/questions/16568313/arrows-on-links-in-d3js-force-layout/16568625
  // this is the only code I have not written entirely myself,
  // since I know nothing about geometry/trigonometry
  // and it is purely to accomplish the visual effect of not having link arrows
  // overlap with the nodes.
  let dx = target.x - start.x;
  let dy = target.y - start.y;
  let gamma = Math.atan2(dy, dx); // Math.atan2 returns the angle in the correct quadrant as opposed to Math.atan
  let tx = target.x - (Math.cos(gamma) * target.radius);
  let ty = target.y - (Math.sin(gamma) * target.radius);
  return {
    x: tx,
    y: ty,
  };
}

/* update function is externally available so
   that React can handle unsubscription of 
   event listeners calling it*/
function update() {

  link = link.data(forceLayout.links(), (d) => {
    return d.index;
  });
  node = node.data(forceLayout.nodes(), (d) => {
    // re-matches data to work with shifting rather than popping
    // to follow stack behaviour 
    d.radius = options.dimensions.radius.node *
      (options.dimensions.radius[d.info.status + 'Factor'] || 1);
    return d.index;
  });

  link.enter()
    .append('line')
    .attr('class', (d) => {
      return 'link link-' + d.status;
    })
    .attr('marker-end', (d) => {
      return (d.status === 'calling') ?
        'url(#arrow-calling)' : 'url(#arrow-returning';
    })
    .transition()
    .duration(500)
    .ease('circle')
    .attrTween('x2', (d) => {
      return (t) => {
        return d3.interpolate(getTargetIntersection(d.target, d.source).x, d.target.x)(t);
      };
    })
    .attrTween('y2', (d) => {
      return (t) => {
        return d3.interpolate(getTargetIntersection(d.target, d.source).y, d.target.y)(t);
      };
    });


  link.exit()
    .remove();

  let nodeGroup = node.enter().append('g')
    .on('dblclick', onDoubleclickNode)
    .call(drag);

  nodeGroup.append('circle')
    .attr('r', options.dimensions.radius.node);

  nodeText = nodeGroup.append('foreignObject')
    .attr('class', 'unselectable function-text');

  node.selectAll('foreignObject').html((d) => {
    return '<div class="pointer unselectable"}>' +
      d.info.displayName + '</div>';
  });

  node.selectAll('circle')
    .attr('class', (d) => {
      return 'function function-' + d.info.status;
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
