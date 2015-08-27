// the interpreter only supports basic built-in functions
// here I add some more wrappers to native functions I wanted to
// see supported for the purpose of this exercise:
// array.map and array.reduce, care of ES5 polyfills.

function init(interpreter, scope) {

  var wrapper = function(callback, initialValue) {
    'use strict';
    callback = interpreter.createNativeFunction(callback);
    if (this == null) {
      throw new TypeError('Array.prototype.reduce called on null or undefined');
    }

    var t = this,
      len = t.length >>> 0,
      k = 0,
      value;
    if (arguments.length == 2) {
      value = arguments[1];
    } else {
      while (k < len && !(k in t)) {
        k++;
      }
      if (k >= len) {
        throw new TypeError('Reduce of empty array with no initial value');
      }
      value = t[k++];
    }
    for (; k < len; k++) {
      if (k in t) {
        value = callback(value, t[k], k, t);
      }
    }
    return value;
  };

/*  var wrapper = function(callback, initialValue) {
    //var thisArray = interpreter.createPrimitive(this);
    var callbackFunc = interpreter.createNativeFunction(callback);
    return interpreter.createPrimitive(Array.prototype.reduce.call(this, callbackFunc, initialValue));

    //return Array.prototype.reduce.call(this, callback, initialValue);
  };*/

  interpreter.setProperty(interpreter.ARRAY.properties.prototype, 'reduce',
    interpreter.createNativeFunction(wrapper), false, true);
}

export default init;
