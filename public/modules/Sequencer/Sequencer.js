import OptionStore from '../stores/OptionStore.js';
import UpdateStore from '../stores/UpdateStore.js';
import Interpreter from '../vendor/JS-Interpreter/interpreter.js';
import astTools from '../astTransforms/astTools.js';
import cloneDeep from 'lodash';

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
    let sequencerOptions = OptionStore.getOptions().sequencer;
    let delay = sequencerOptions.delay;

    function nextStep() {
      let newState = cloneDeep(interpreter.stateStack[0]).valueOf();
      UpdateStore.sendUpdate(newState);
      console.log(newState);
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

export default new Sequencer;
