'use strict';

export function sumDemo () {
var arrayToSum = [3, 5, 5, 10];
var sum = 0;

var sumFunction = function sumFunction() {
	for (var i = 0; i < arrayToSum.length; i++) {
		sum += arrayToSum[i];
	}
};

sumFunction();
console.log(sum);
}