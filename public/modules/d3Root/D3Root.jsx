import d3 from 'd3';
import React from 'react';

class D3Root {

    componentDidMount() {
        var domNode = React.findDOMNode(this);
        createChart(domNode, this.props);
    }
    render() {
        return (
            <div id="d3Root">Hello, {this.props.word}</div>
        )
    }
};
D3Root.PropTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    margin: React.PropTypes.number,
    somethingElse: React.PropTypes.number.isRequired
};
D3Root.defaultProps = {
    width: 600,
    height: 600,
    margin: 20
};

function createChart(domNode, props) {

    console.log(props);
    var canvasWidth = props.width + props.margin;
    var canvasHeight = props.height + props.margin;

    d3.select(domNode).append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)
        .append('g')
        .attr('class', 'd3Window')
        .attr('width', props.width)
        .attr('height', props.height)
        .attr('transform', `translate(${props.margin},${props.margin})`)
        .append("text")
        .attr('class', 'function-block')
        .attr("x", 10)
        .attr("y", 10)
        .attr("dy", ".35em")
        .text(	'd3 appended element inside react component - first attempt');
}

export default D3Root;
