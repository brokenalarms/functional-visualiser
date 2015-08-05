import React from 'react';
import d3 from 'd3';

// ======================================================
// D3 helper functions - D3 controls this React component
// ======================================================

function testD3(element) {
  var width = 640,
    height = 480;

  // Define the data for the example. In general, a force layout
  // requires two data arrays. The first array, here named `nodes`,
  // contains the object that are the focal point of the visualization.
  // The second array, called `links` below, identifies all the links
  // between the nodes. (The more mathematical term is "edges.")

  // For the simplest possible example we only define two nodes. As
  // far as D3 is concerned, nodes are arbitrary objects. Normally the
  // objects wouldn't be initialized with `x` and `y` properties like
  // we're doing below. When those properties are present, they tell
  // D3 where to place the nodes before the force layout starts its
  // magic. More typically, they're left out of the nodes and D3 picks
  // random locations for each node. We're defining them here so we can
  // get a consistent application of the layout which lets us see the
  // effects of different properties.

  var nodes = [{
    x: width / 3,
    y: height / 2
  }, {
    x: 2 * width / 3,
    y: height / 2
  }];

  // The `links` array contains objects with a `source` and a `target`
  // property. The values of those properties are the indices in
  // the `nodes` array of the two endpoints of the link.

  var links = [{
    source: 0,
    target: 1
  }];

  // Here's were the code begins. We start off by creating an SVG
  // container to hold the visualization. We only need to specify
  // the dimensions for this container.

  var svg = d3.select(element)
    .attr('width', width)
    .attr('height', height);

  // Now we create a force layout object and define its properties.
  // Those include the dimensions of the visualization and the arrays
  // of nodes and links.

  var force = d3.layout.force()
    .size([width, height])
    .nodes(nodes)
    .links(links);

  // There's one more property of the layout we need to define,
  // its `linkDistance`. That's generally a configurable value and,
  // for a first example, we'd normally leave it at its default.
  // Unfortunately, the default value results in a visualization
  // that's not especially clear. This parameter defines the
  // distance (normally in pixels) that we'd like to have between
  // nodes that are connected. (It is, thus, the length we'd
  // like our links to have.)

  force.linkDistance(width / 2);

  // Next we'll add the nodes and links to the visualization.
  // Note that we're just sticking them into the SVG container
  // at this point. We start with the links. The order here is
  // important because we want the nodes to appear "on top of"
  // the links. SVG doesn't really have a convenient equivalent
  // to HTML's `z-index`; instead it relies on the order of the
  // elements in the markup. By adding the nodes _after_ the
  // links we ensure that nodes appear on top of links.

  // Links are pretty simple. They're just SVG lines, and
  // we're not even going to specify their coordinates. (We'll
  // let the force layout take care of that.) Without any
  // coordinates, the lines won't even be visible, but the
  // markup will be sitting inside the SVG container ready
  // and waiting for the force layout.

  var link = svg.selectAll('.link')
    .data(links)
    .enter().append('line')
    .attr('class', 'function-link');

  // Now it's the nodes turn. Each node is drawn as a circle.

  var node = svg.selectAll('.node')
    .data(nodes)
    .enter().append('circle')
    .attr('class', 'function-node');

  // We're about to tell the force layout to start its
  // calculations. We do, however, want to know when those
  // calculations are complete, so before we kick things off
  // we'll define a function that we want the layout to call
  // once the calculations are done.

  force.on('end', function() {

    // When this function executes, the force layout
    // calculations have concluded. The layout will
    // have set various properties in our nodes and
    // links objects that we can use to position them
    // within the SVG container.

    // First let's reposition the nodes. As the force
    // layout runs it updates the `x` and `y` properties
    // that define where the node should be centered.
    // To move the node, we set the appropriate SVG
    // attributes to their new values. We also have to
    // give the node a non-zero radius so that it's visible
    // in the container.

    node.attr('r', width / 25)
      .attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y;
      });

    // We also need to update positions of the links.
    // For those elements, the force layout sets the
    // `source` and `target` properties, specifying
    // `x` and `y` values in each case.

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

  });

  // Okay, everything is set up now so it's time to turn
  // things over to the force layout. Here we go.

  force.start();
}

function initialize(element, dimensions) {

  const width = dimensions[0];
  const height = dimensions[1];

  d3.select(element)
    .attr('width', dimensions[0])
    .attr('height', dimensions[1]);
}

function update(element, nodes, dimensions) {
  const svg = d3.select(element);
  const width = dimensions[0];
  const height = dimensions[1];

  var nodes = [{
    x: width / 3,
    y: height / 2
  }, {
    x: 2 * width / 3,
    y: height / 2
  }];

  // The `links` array contains objects with a `source` and a `target`
  // property. The values of those properties are the indices in
  // the `nodes` array of the two endpoints of the link.

  var links = [{
    source: 0,
    target: 1
  }];

  const forceLayout = d3.layout.force()
    .nodes(nodes)
    .linkDistance(svg.attr('width') / 2);

  console.log('updating');
  svg.selectAll('.function-node')
    .data(nodes)
    .enter().append('circle')
    .attr('class', 'function-node')
    .append('text', function(d) {
      return d.id.Identifier.name;
    });

  forceLayout.on('end', function() {
    nodes.attr('r', svg.attr('width') / 25)
      .attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y;
      });
  });

  forceLayout.start();
}


class D3Root extends React.Component {

  static propTypes = {
    funcMap: React.PropTypes.array,
    dimensions: React.PropTypes.array,
  }

  constructor() {
    super();
  }

  componentDidMount = () => {
    const element = React.findDOMNode(this);
    const dimensions = this.props.dimensions;
    console.log('d3root first update');
    testD3(element);
    /*    initialize(element, dimensions);
        if (this.props.funcMap) {
          update(element, this.props.funcMap, dimensions);
        }*/
  }
  componentWillReceiveProps(nextProps) {
    console.log('d3root has received props');
    console.log(nextProps);
  }

  componentWillUpdate = () => {
    console.log('d3root updating');
    const element = React.findDOMNode(this);
    const funcMap = this.props.funcMap;
    update(element, funcMap, this.props.dimensions);
  }

  componentDidUpdate = () => {
    console.log('d3root updated');
    const element = React.findDOMNode(this);
    this.update(element).bind(this);
  }

  render() {
    // const ast = astParser(this.props.codeLocation);
    return (
      <svg className="d3-root" />
    );
  }

}
export default D3Root;
