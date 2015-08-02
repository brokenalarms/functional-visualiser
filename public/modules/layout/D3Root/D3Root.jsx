import React from 'react';
import d3 from 'd3';

export default class D3Root extends React.Component {

    constructor(props) {
        super(props);
        this.element = null;
    }

    componentDidMount = () => {
        this.element = React.findDOMNode(this);
        initialize(this.element);
    }
    componentWillReceiveProps(nextProps) {
        console.log('d3root has received props');
        console.log(nextProps);
    }

    componentWillUpdate() {
        console.log('d3root updating');
    }

    componentDidUpdate() {
        console.log('d3root updated');
        update(this.element);
    }

    render() {
        return (
            <div className="d3-test" />)
    }
};

function initialize(element) {
    d3.select(element).append('svg').attr('class', 'function-block')
        .append('text')
        .attr('x', 10)
        .attr('y', 10)
        .attr('dy', '.35em')
        .text('d3 appended element inside react component - first attempt');
    console.log('drawn');
}

function update(element) {
    d3.select(element)
        .append('text')
        .text('element updated');
}
