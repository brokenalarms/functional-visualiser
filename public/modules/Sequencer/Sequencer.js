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
    let astWithLocations = astTools.createAst(runString, true);
    let interpreter = new Interpreter(astWithLocations);
    let sequencerOptions = OptionStore.getOptions().sequencer;
    let delay = sequencerOptions.delay;

    function nextStep() {
      if (interpreter.step()) {
        // TODO - check state, if we don't care (ie superflous navigations into uncalled function declarations) then advance to the next
        // only then set the timeout and tell d3 to draw, to keep the animation smooth
        //let newState = cloneDeep(interpreter.stateStack[0]).valueOf();
        let newState = interpreter.stateStack[0];
        let state = {
          range: getCodeRange(newState),
        };
        UpdateStore.updateState(state);
        setTimeout(nextStep, delay);
      }
    }
    nextStep();
  }

  function getCodeRange(newState) {
    if (newState.node) {
      let loc = newState.node.loc;
      let range = {
        start: {
          row: loc.start.line,
          column: loc.start.column,
        },
        end: {
          row: loc.end.line,
          column: loc.end.column,
        },
      };
      return range;
    }
    return null;
  }

  return {
    start,
  };

}

export default new Sequencer;
