'use strict';

export function sumDemo () {
var sumFunction = function (arrayToSum) {
	return arrayToSum.reduce(function (a, b) {
		return a + b;
	}, 0);
};

console.log(sumFunction([3, 5, 5, 10]));
};