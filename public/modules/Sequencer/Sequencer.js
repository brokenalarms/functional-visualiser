import OptionStore from '../stores/OptionStore.js';
import UpdateStore from '../stores/UpdateStore.js';
import Interpreter from '../vendor/JS-Interpreter/interpreter.js';
import astTools from '../astTransforms/astTools.js';

function Sequencer() {

  function initFunc(interpreter, scope) {
    interpreter.setProperty(scope, 'return', function() {
      console.log('return found');
    });
  }


  function start() {
    let codeString = OptionStore.getOptions().selectedCode;
    let runString = '(' + codeString + ')()';
    let interpreter = new Interpreter(runString);
    let delay = OptionStore.getOptions().sequencer.delay;

    function nextStep() {
      UpdateStore.sendUpdate(interpreter.stateStack[0]);
      if (interpreter.step()) {
        setTimeout(nextStep, delay);
      }
    }
    nextStep();
  }

  return {
    start,
  };

}

export default Sequencer;
