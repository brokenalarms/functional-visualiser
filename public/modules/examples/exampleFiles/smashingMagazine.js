const id = 'smashingMagazineDemo';
const name = 'demo from Smashing Magazine';
const description = '';

function demo() {

  function addNumbers(a, b) {
    return a + b;
  }

  function totalForArray(currentTotal, arr) {
    currentTotal = addNumbers(currentTotal, arr[0]);

    var remainingArr = arr.slice(1);

    if (remainingArr.length > 0) {
      return totalForArray(currentTotal, remainingArr);
    } else {
      return currentTotal;
    }
  }

  function totalForArray(arr) {
    return arr.reduce(addNumbers);
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
    }
  }

  function pluck(arr, propertyName) {
    return arr.map(getItem(propertyName));
  }

  function combineArrays(arr1, arr2, finalArr) {
    // Just so we don't have to remember to pass an empty array as the third
    // argument when calling this function, we'll set a default.
    finalArr = finalArr || [];

    // Push the current element in each array into what we'll eventually return
    finalArr.push([arr1[0], arr2[0]]);

    var remainingArr1 = arr1.slice(1),
      remainingArr2 = arr2.slice(1);

    // If both arrays are empty, then we're done
    if (remainingArr1.length === 0 && remainingArr2.length === 0) {
      return finalArr;
    } else {
      // Recursion!
      return combineArrays(remainingArr1, remainingArr2, finalArr);
    }
  }

  var processed = combineArrays(pluck(data, 'temperatures').map(averageForArray), pluck(data, 'population'));
}

export default {
  id, name, description, demo,
};
