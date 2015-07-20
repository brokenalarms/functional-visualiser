import React from 'react';

import d3 from 'd3';

var drawFunc = function() {
console.log('drawing');
d3.selectAll('.d3-test').append('svg').attr('class', 'function-block')
	.append("text")
    .attr("x", 10)
    .attr("y", 10)
    .attr("dy", ".35em")
    .text('d3 appended element inside react component - first attempt');
console.log('drawn');
};

export default drawFunc;