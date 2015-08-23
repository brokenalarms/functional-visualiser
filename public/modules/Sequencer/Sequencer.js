import OptionStore from '../stores/OptionStore.js';
import UpdateStore from '../stores/UpdateStore.js';
import Interpreter from '../vendor/JS-Interpreter/interpreter.js';
import astTools from '../astTransforms/astTools.js';
import interpreterTools from './interpreterTools.js';


import cloneDeep from 'lodash';

function Sequencer() {

  let doneAction = false;

  function start() {
    let codeString = OptionStore.getOptions().selectedCode;
    let runString = '(' + codeString + ')()';
    let astWithLocations = astTools.createAst(runString, true);
    let execCode = astTools.createCode(astWithLocations);
    // save back so the dynamic selection range is correct
    UpdateStore.getState().execCode = execCode;
    let interpreter = new Interpreter(astWithLocations);
    let sequencerOptions = OptionStore.getOptions().sequencer;
    let delay = sequencerOptions.delay;

    let state;
    let prevState;
    // direct access so the d3 forceLayout can track added/removed nodes
    let nodes = UpdateStore.getState().nodes;
    let links = UpdateStore.getState().links;

    function nextStep() {
      if (interpreter.step()) {
        doneAction = false;
        state = interpreter.stateStack[0];
        if (state) {
          console.log(state);
          updateVisibleFunctionNodes(state, prevState, nodes);

          if (doneAction) {
            // TODO - prevState for enter, current state for leaving code
            UpdateStore.getState().range = interpreterTools.getCodeRange(//prevState);
            UpdateStore.getState().execCodeLine = astTools.createCode(prevState.node);
            UpdateStore.sendUpdate();

          }
          prevState = state;
          setTimeout(nextStep, (doneAction) ? delay : 0);
        }
      }
    }
    nextStep();
  }

  let visibleScopes = new Map(); // if it's in the set, the scope is visible
  function updateVisibleFunctionNodes(state, prevState, nodes) {
    if (prevState) {
      if (interpreterTools.isFunctionCall(state, prevState)) {
        doneAction = true;
        state.scope.caller = prevState;
        let d3Node = state.node;
        let name = prevState.node.callee.name || prevState.node.callee.id.name;
        visibleScopes.set(name, prevState.node);
        d3Node.d3Info = {
          name,
        };
        nodes.push(d3Node);
      } else if (interpreterTools.isExitingFunction(state, prevState, visibleScopes)) {
        let calleeName = interpreterTools.getExitingCalleeName(state, prevState);
        visibleScopes.delete(calleeName);
        doneAction = true;
        nodes.pop();
      }
    }
  }

  return {
    start,
  };

}

export default new Sequencer;
