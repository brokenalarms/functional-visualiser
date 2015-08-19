//import OptionStore from '../stores/OptionStore.js';
//import UpdateStore from '../stores/UpdateStore.js';
import Interpreter from '../vendor/JS-Interpreter/interpreter.js';


function Sequencer() {

  function initFunc(interpreter, scope) {
    interpreter.setProperty(scope, 'return', function() {
      console.log('return found');
    });
  }


  function start() {
  	let code = OptionStore.getOptions().
    let interpreter = new Interpreter(sampleCode.toString(), initFunc)

    function nextStep() {
      setTimeout(() => {
        while (interpreter.step()) {
          console.log(interpreter.stackTrace[0]);
          nextStep();
        }
      }, 500);
    }
    nextStep();
  }

  return {
    start,
  };

}

export default Sequencer;
