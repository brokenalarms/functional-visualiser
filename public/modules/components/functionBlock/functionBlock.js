import d3 from 'd3';

var drawFunc = function() {
console.log('drawing');
d3.selectAll('.test').append('svg').attr('class', 'function-block');
console.log('drawn');
};

export { drawFunc as default };