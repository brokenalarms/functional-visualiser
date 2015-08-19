

import Interpeter from './modules/vendor/JS-Interpreter/interpreter.js';


function nestedReturn() {
  function foo() {
    function bar() {
      return 'barReturnString';
    }
    return bar();
  }
  return foo();
};

//sampleCode = '6 +7';

function initFunc(interpreter, scope) {
  interpreter.setProperty(scope, 'return', function() {
    console.log('return found')
  })
}

var interpreter = new Interpeter(sampleCode.toString(), initFunc);

function nextStep() {
  while (interpreter.step()) {

    console.log(interpreter.value);
    nextStep();

  }
}
nextStep();

let blah = eval (sampleCode)
console.log(blah())