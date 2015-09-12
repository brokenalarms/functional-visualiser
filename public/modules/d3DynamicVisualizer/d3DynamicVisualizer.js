import SequencerStore from '../stores/SequencerStore.js';

let options = {
  rootPositionFixed: false,
  singleStepDelay: 700,
  d3Force: {
    tuningFactor: (nodes) => {
      return Math.max(Math.sqrt(nodes.length / (options.dimensions.width * options.dimensions.height)), 80);
    },
    charge: -500,
    chargeDistance: 500,
    gravity: 0.03,
    gravityFunc: (nodes) => {
      return 100 * tuningFactor(nodes);
    },
  },
  cssVars: {
    colorPrimary: '#2196F3',
    colorSecondary: '#4CAF50',
    warningErrorRange: ['#4CAF50', '#8BC34A', '#CDDC39', '#FDD835', '#FFC107', '#FF9800', '#FF5722',
      '#F44336', '#D50000',
    ],
  },
  dimensions: {
    radius: {
      node: 10,
      factor: {
        'function': 1,
        'root': 1.6,
        'failure': 1.2,
        'finished': 4,
      },
    },
    labelBuffer: 50,
    width: null,
    height: null,
  },
  links: {
    strength: function(d) {
      return 0.9;
    },
    distance: function(nodes) {
      return Math.sqrt((options.dimensions.width * options.dimensions.height)) / (nodes.length);
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
let svg, node, nodeText, link, forceLayout, drag, rootNode, finished;

// shared by externally available update function
function initialize(element, nodes, links, dimensions) {
  // cleanup vars to prevent rootNode remaining allocated
  destroy();
  options.dimensions.width = dimensions.width;
  options.dimensions.height = dimensions.height;


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
      .attr('refX', 16)
      .attr('refY', 8)
      .attr('markerWidth', 30)
      .attr('markerHeight', 30)
      .attr('orient', 'auto')
      .style('fill', arrow[1])
      .append('svg:path')
      .attr('d', 'M0,0 L0,16 L16,8 L0,0');
  });
}

function createNewForceLayout(graphType, nodes, links) {
  let force = d3.layout.force()
    .links(links)
    .nodes(nodes)
    .size([options.dimensions.width, options.dimensions.height])
    .linkDistance(options.links.distance.bind(this, nodes))
    .charge(options.d3Force.charge)
    .friction(0.7)
    .gravity(options.d3Force.gravity)
    .linkStrength(options.links.strength)
    .chargeDistance(options.d3Force.chargeDistance)
    .on('tick', tick);

  // for keeping nodes within the boundaries
  const inlay = options.dimensions.radius.node * 2;

  return force;

  function tick() {
    link.attr('x1', function(d) {
        d.source.x = getBoundingX(d.source.x);
        return getCirclePerimiterIntersection(d.target, d.source, 'x');
      })
      .attr('y1', function(d) {
        d.source.y = getBoundingY(d.source.y);
        return getCirclePerimiterIntersection(d.target, d.source, 'y');
      })
      .attr('x2', function(d) {
        d.target.x = getBoundingX(d.target.x);
        return getCirclePerimiterIntersection(d.source, d.target, 'x');
      })
      .attr('y2', function(d) {
        d.target.y = getBoundingY(d.target.y);
        return getCirclePerimiterIntersection(d.source, d.target, 'y');
      });

    function getBoundingX(x) {
      return Math.max(inlay, Math.min(options.dimensions.width - options.dimensions.labelBuffer, x));
    }

    function getBoundingY(y) {
      return Math.max(inlay, Math.min(options.dimensions.height, y));
    }

    node.attr('transform', (d) => {
      d.x = getBoundingX(d.x);
      d.y = getBoundingY(d.y);
      return `translate(${d.x},${d.y})`;
    });
    nodeText.attr('transform', (d) => {
      return `translate(${d.radius + 10},${-(d.radius + 10)})`;
    });
  }

}

function getCirclePerimiterIntersection(start, target, coord) {
  // NOTE: This particular function to calculate the distance of the line
  // to the edge of the circle, rather than to the center point of the node, 
  // is taken from this source:
  // http://stackoverflow.com/questions/16568313/arrows-on-links-in-d3js-force-layout/16568625
  // these three lines involving atan2, cos and sin are the 
  // only code I have not written entirely myself,
  // since I know nothing about geometry/trigonometry
  // and it is purely to accomplish the visual effect of not having link arrows
  // overlap with the nodes.
  let dx = target.x - start.x;
  let dy = target.y - start.y;
  // Math.atan2 returns the angle in the correct quadrant as opposed to Math.atan
  let gamma = Math.atan2(dy, dx);
  if (coord === 'x') {
    return target.x - (Math.cos(gamma) * target.radius);
  }
  return target.y - (Math.sin(gamma) * target.radius);
}

/* update function is externally available so
   that React can handle unsubscription of 
   event listeners calling it*/

function update() {
  if (!link || !node) {
    return;
  }

  link = link.data(forceLayout.links(), (d) => {
    // not the d3 generated node index; this is my own:
    // link needs to be re-indexed on return in order
    // to show different green arrowhead
    return d.linkIndex;
  });
  node = node.data(forceLayout.nodes(), (d) => {
    // re-matches data to work with shifting rather than popping
    // to follow stack behaviour 
    d.radius = options.dimensions.radius.node *
      (options.dimensions.radius.factor[d.type]);
    return d.index;
  });

  // set up arrow/line drawing to sync up with live Sequencer options
  let singleStep = SequencerStore.getOptions().singleStep;
  let delay = SequencerStore.getOptions().sequencerDelay;
  let delayFactor = SequencerStore.getOptions().delayFactor;
  let visualizerPercentageOfDelay = (SequencerStore.getOptions().staggerEditorAndVisualizer) ?
    SequencerStore.getOptions().visualizerPercentageOfDelay : 1;
  let singleStepDelay = options.singleStepDelay;
  let transitionDelay = (singleStep) ? singleStepDelay : (delay * delayFactor / visualizerPercentageOfDelay);

  let newLink = link.enter();

  newLink.append('line')
    .attr('class', (d) => {
      return 'link link-' + d.linkState;
    })
    .attr('marker-end', (d) => {
      return (d.linkState === 'calling') ?
        'url(#arrow-calling)' : 'url(#arrow-returning';
    })
    .transition()
    .duration(transitionDelay)
    .ease('circle')
    .attrTween('x2', (d) => {
      return (t) => {
        return d3.interpolate(getCirclePerimiterIntersection(d.target, d.source, 'x'), d.target.x)(t);
      };
    })
    .attrTween('y2', (d) => {
      return (t) => {
        return d3.interpolate(getCirclePerimiterIntersection(d.target, d.source, 'y'), d.target.y)(t);
      };
    });

  let nodeGroup = node.enter().append('g')
    .on('dblclick', onDoubleclickNode)
    .call(drag);

  if (!rootNode) {
    rootNode = nodeGroup;
  }

  nodeGroup.append('circle')
    .attr('r', options.dimensions.radius.node);

  nodeText = nodeGroup.append('foreignObject')
    .attr('class', 'unselectable function-text');

  let allText = node.selectAll('foreignObject');
  // trigger single text animation via internal flag on node
  let updateText = allText.filter((d) => {
    if (d.updateText) {
      d.updateText = false;
      return true;
    }
  });
  // swap out old text with new text
  // d3 will not notice changed text
  // unless this is done to all nodes
  allText.html((d) => {
    return '<div class="pointer unselectable function-text"}>' +
      d.displayName + '</div>';
  });

  function shrinkAndGrowText(selection) {
    selection.transition().duration(transitionDelay / 2)
      .attr('opacity', 0)
      .attr('class', 'update-text-shrink')
      .each('end', () => {
        selection.transition().duration(transitionDelay / 2)
          .attr('opacity', 1)
          .attr('class', 'unselectable function-text');
      });
  }
  // hide the text that is to be updated then re-grow
  let animateText = updateText.select('div');
  shrinkAndGrowText(animateText);

  node.selectAll('circle')
    .attr('class', (d) => {
      return 'function ' + d.type + ' ' + (d.status || '') +
        ((d.fixed) ? ' function-fixed' : '');
    });

  // make the root node more 'angry' and bigger for each error... 
  let maxAllowedErrors = options.cssVars.warningErrorRange.length - 1;
  let errorCount = 0;
  let endGroup = rootNode.select('circle');

  endGroup.classed('finished', (d) => {
      if (d.status === 'finished') {
        rootNode.select('foreignObject')
          .html('<div class="finish-text"><div>' +
            ((d.errorCount > 0) ? d.errorCount : 'No') + ' critical errors.</div>' +
            ((!d.errorCount) ? '<div>FUNCTIONAL.</div></div>' : '</div>'));
        return (finished = true);
      }
    })
    .transition()
    .duration(singleStepDelay)
    .attr('r', (d) => {
      errorCount = d.errorCount;
      let nodeSize = errorCount + (options.dimensions.radius.node * options.dimensions.radius.factor.root);
      d.radius = Math.min(nodeSize + errorCount * options.dimensions.radius.factor.root,
        nodeSize + maxAllowedErrors * options.dimensions.radius.factor.root);
      return d.radius;
    })
    .attr('fill', (d) => {
      return options.cssVars.warningErrorRange[Math.min(errorCount, maxAllowedErrors)];
    });

  if (errorCount > maxAllowedErrors) {
    rootNode.call(pulse);
  }

  // break links exceeding max return capacity,
  // then fade out their nodes
  link.exit().remove();

  node.exit()
    .transition()
    .duration(singleStepDelay)
    .style('opacity', 0)
    .remove();
  // the above alone does not fade out foreignObject text
  // so I fade out the text twice as fast as well, which is less obtrusive
  node.exit().selectAll('foreignObject')
    .transition()
    .duration(singleStepDelay / 2)
    .style('opacity', 0)
    .remove();


  // don't restart the layout if only text has changed,
  // otherwise this causes the forceLayout to 'kick' when
  // the parameter text is the only thing that updates
  let newNodesLength = nodeGroup[0].length;
  let newLinksLength = newLink[0].length;
  if ((newNodesLength > 0 && nodeGroup[0][newNodesLength - 1] !== null) ||
    (newLinksLength > 0 && newLink[0][newLinksLength - 1] !== null)) {
    forceLayout.start();
  }

  function pulse() {
    if (rootNode && !finished) {
      rootNode.select('circle')
        .transition()
        .duration(250)
        .attr('r', (d) => {
          return d.radius;
        })
        .transition()
        .duration(250)
        .attr('r', (d) => {
          return d.radius * 1.1;
        })
        .ease('ease')
        .each('end', pulse);
    }
  }
}


function onDragStart(d) {
  if (!finished) {
    d3.select(this).select('circle').classed('function-fixed no-transition', d.fixed = true);
    // prevents browser scrolling whilst dragging about node
    d3.event.sourceEvent.preventDefault();
  }
}

function onDoubleclickNode(d) {
  if (!finished) {
    d3.select(this).select('circle').classed('function-fixed no-transition', d.fixed = false);
  }
}

function destroy() {
  // probably not necessary if React resets components
  if (svg) {
    svg.selectAll('*').remove();
    forceLayout.stop();
  }
  svg = forceLayout = node = link = rootNode = null
  finished = false;
}

export default {
  initialize, update, destroy,
};
