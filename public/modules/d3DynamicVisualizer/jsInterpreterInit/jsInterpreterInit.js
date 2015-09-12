// the interpreter only supports basic built-in functions
// here I add some more wrappers to native functions I wanted to
// see supported for the purpose of this exercise:
// array.map and array.reduce, care of lodash and ES5 polyfills.


function init(interpreter, scope) {

  var map = function map(iteratee, array) {

    array = this;
    iteratee = interpreter.FUNCTION.nativeFunc(iteratee)

    var index = -1,
      length = array.length,
      result = [];
    result.length = length;

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return interpreter.wrapPrimitive(result);
  }

  var reduce = function reduce(array, callback, initialValue) {

    var array = this;
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


  interpreter.setProperty(interpreter.ARRAY.properties.prototype, 'map',
    interpreter.createNativeFunction(map), false, true);
  interpreter.setProperty(interpreter.ARRAY.properties.prototype, 'reduce',
    interpreter.createNativeFunction(reduce), false, true);
}

export default init;
