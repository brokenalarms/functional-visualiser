'use strict';

var sum = function(arrayToSum){
	return arrayToSum.reduce((a,b) => {return a+b}, 0)
};


console.log(sum([3,5,5,10]));