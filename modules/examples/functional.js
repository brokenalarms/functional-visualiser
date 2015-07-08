'use strict';

export function sumDemo () {
var sum = function sum(arrayToSum) {
	return arrayToSum.reduce(function (a, b) {
		return a + b;
	}, 0);
};

console.log(sum([3, 5, 5, 10]));
};