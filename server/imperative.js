var arrayToSum = [3,5,5,10];
var sum = 0;

var sumStuff = function() {
	for (var i = 0; i < arrayToSum.length; i++) {
		sum += arrayToSum[i] ;
	};
};

sumStuff();
console.log(sum);