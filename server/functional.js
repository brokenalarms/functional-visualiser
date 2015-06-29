var sumStuff = function(arrayToSum){
	return arrayToSum.reduce((a,b) => {return a+b}, 0)
};


console.log(sumStuff([3,5,5,10]));