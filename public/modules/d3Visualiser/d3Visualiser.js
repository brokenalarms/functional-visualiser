// TODO - extract options into d3OptionsStore
let options = {
  graphType: 'd3',
  d3Force: {
    charge: -400,
    chargeDistance: 500,
    gravity: 0.05,
  },
  layout: {
    globalScopeFixed: false,
  },
  width: null,
  height: null,
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
      return 0.01;
    },
    distance: function(nodeCount) {
      return options.width / Math.min(4, nodeCount - 1);
    },
  },
};




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

function initialize(element, nodes, links, dimensions) {
  options.dimensions = dimensions;

  // cleanup if React udpates and doesn't re-mount DOM element
  d3.select(element).selectAll('*').remove();

  let svg = d3.select(element).append('svg')
    .attr('class', 'd3-root')
    .attr('width', options.dimensions.width)
    .attr('height', options.dimensions.height);
  appendArrow(svg);

  let forceLayout = createNewForceLayout(options.graphType, nodes, links);
  forceLayout.on('tick', tick);

  let link = svg.selectAll('.link');
  let node = svg.selectAll('.node');

  function tick() {
    node.attr("cx", function(d) {
        return d.x;
      })
      .attr("cy", function(d) {
        return d.y;
      })

    link.attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });
  }

  function update() {
    link = link.data(forceLayout.links());
    node = node.data(forceLayout.nodes());
    link.enter().insert("line", ".node").attr("class", "function-link");
    link.exit().remove();

    node.enter().append("circle").attr("class", "function-node").attr("r", 8);
    node.exit().remove();

    forceLayout.start();
  }

  /* subscribe listener to start redrawing
     when the dynamic simulation is started */
  UpdateStore.subscribeListener(function(newState) {
    update(newState);
  });

  // TODO this can be moved to the play button
  // delay to let everything load so the animation doesn't start jerky
  setTimeout(() => {
      let sequencer = Sequencer.start();
    }, 1000);
    // update();
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
  let forceLayout;
  if (graphType === 'd3') {
    forceLayout = d3.layout.force();
  } else if (graphType === 'cola') {
    // colaJS improves and stabilises the d3 force layout graph
    forceLayout = cola.d3adaptor();
  }
  forceLayout
    .nodes(nodes)
    .links(links)
    .size([options.dimensions.width, options.dimensions.height])
    .linkDistance(options.links.distance.bind(this, nodes.length));

  if (graphType === 'd3') {
    forceLayout
      .charge(options.d3Force.charge)
      .gravity(options.d3Force.gravity)
      .linkStrength(options.links.strength)
      .chargeDistance(options.d3Force.chargeDistance);
  } else if (graphType === 'cola') {
    forceLayout
      .avoidOverlaps(true)
      .start();
  }
  return forceLayout;
}

export default initialize;
