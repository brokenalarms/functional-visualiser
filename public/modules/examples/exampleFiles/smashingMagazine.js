const id = 'smashingMagazineDemo';
const title = 'Smashing Magazine demo';
const description = '';

function Program() {
  /* NOTE - this example does not work with the
     'static' Proof of Concept visualization - I 
     stopped work on that before I began working
     with this. The static POC was only intended to get me
     to grips with the various challenges involved
     for the dynamic visualization. */

  /* This code is an adaptation of that supplied with the 
     Smashing Magazine article, "Don't be Afraid of Functional
     Programming", by Jonathan Morgan. It can be found here:
     http://www.smashingmagazine.com/2014/07/dont-be-scared-of-functional-programming 
     */

  function map(iteratee, array) {
    var index = -1,
      length = array.length,
      result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  function reduce(array, callback, initialValue) {
    var len = array.length >>> 0,
      index = 0,
      accumulator;
    if (arguments.length == 2) {
      accumulator = arguments[1];
    } else {
      while (index < len && !(index in array)) {
        index++;
      }
      accumulator = array[index++];
    }
    for (; index < len; index++) {
      if (index in array) {
        accumulator = callback(accumulator, array[index]);
      }
    }
    return accumulator;
  }

  var data = [{
    name: 'Jamestown',
    population: 2047,
    temperatures: [-34, 67, 101, 87]
  }, {
    name: 'Awesome Town',
    population: 3568,
    temperatures: [-3, 4, 9, 12]
  }, {
    name: 'Funky Town',
    population: 1000000,
    temperatures: [75, 75, 75, 75, 75]
  }];

  function addNumbers(a, b) {
    return a + b;
  }

  function totalForArray(arr) {
    return reduce(arr, addNumbers);
  }

  function average(total, count) {
    return total / count;
  }

  function averageForArray(arr) {
    return average(totalForArray(arr), arr.length);
  }

  // Pass in the name of the property that you'd like to retrieve
  function getItem(propertyName) {
    // Return a function that retrieves that item, but don't execute the function.
    // We'll leave that up to the method that is taking action on items in our 
    // array.
    return function(item) {
      return item[propertyName];
    };
  }

  function pluck(arr, propertyName) {
    return map(getItem(propertyName), arr);
  }

  function combineArrays(arr1, arr2, finalArr) {
    // Just so we don't have to remember to pass an empty array as the third
    // argument when calling this function, we'll set a default.
    finalArr = finalArr || [];

    // Push the current element in each array into what we'll eventually return
    finalArr[finalArr.length] = [arr1[0], arr2[0]];

    var remainingArr1 = arr1.slice(1),
      remainingArr2 = arr2.slice(1);

    // If both arrays are empty, then we're done
    if (remainingArr1.length === 0 && remainingArr2.length === 0) {
      return finalArr;
    }
    return combineArrays(remainingArr1, remainingArr2, finalArr);
  }

  /*  var processed = combineArrays(
      map(averageForArray, pluck(data, 'temperatures')),
      pluck(data, 'population'));
  */
  var populations = pluck(data, 'population');
  var allTemperatures = pluck(data, 'temperatures');
  var averageTemps = map(averageForArray, allTemperatures);
  var processed = combineArrays(averageTemps, populations);
}


export default {
  id, title, description, func: Program,
};
