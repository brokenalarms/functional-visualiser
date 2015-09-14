'use strict';
import {cloneDeep} from 'lodash';
import CodeStore from '../../stores/CodeStore.js';
import CodeStatusStore from '../../stores/CodeStatusStore.js';
import SequencerStore from '../../stores/SequencerStore.js';
import Interpreter from '../../vendor_mod/JS-Interpreter/interpreter.js';
import initFunc from '../jsInterpreterInit/jsInterpreterInit.js';
import astTools from '../../astTools/astTools.js';
import StateToNodeConverter from '../StateToNodeConverter/StateToNodeConverter.js';

/* Sequencer for d3DynamicVisualizer/Editor.
   controlled by React ControlBar via SequencerStore store.
   Inteprets next state, updates SequencerStore and drives synchronized
   events to the Editor and visualizer underneath React. 

   Follows the initialise/update pattern as D3, as essentially
   this module performs a pre-processing of the interpreter results
   before each D3 forceLayout update.
*/
function Sequencer() {

  let interpreter;
  let astWithLocations;
  let stateToNodeConverter;

  function displaySnackBarError(action, message) {
    SequencerStore.setStepOutput({
      warning: {
        action,
        message: `"${message.message || message}"
        (Only basic built-in methods and ES5 supported)`,
      },
    });
    SequencerStore.sendUpdate();
  }

  /* run once on code parse from editor.
     State can then be reset without re-parsing.
     Parsing will select user-written code once
     they have worked on/changed a preset example. */
  function parseCodeAsIIFE() {

    let codeString = (CodeStore.get());
    let runCodeString = astTools.getRunCodeString(codeString);
    try {
      astWithLocations = astTools.createAst(runCodeString, true);
    } catch (e) {
      // display message if user types in invalid code;
      displaySnackBarError('Parser error', e);
      return;
    }
    resetInterpreterAndSequencerStore();
  }

  /* resets interpreter and SequencerStore state to begin the program again,
     without re-parsing code. */
  function resetInterpreterAndSequencerStore() {
    SequencerStore.resetState();
    /* SequencerStore now has new node/link refs,
       update via function closure */
    stateToNodeConverter =
      new StateToNodeConverter(SequencerStore.linkState().nodes,
        SequencerStore.linkState().links);
    // there isn't an AST if we switch from dynamic without parsing
    if (astWithLocations) {
      /* create deep copy so that d3 root modifications
       and interpreter transformations are not maintained */
      let sessionAst = cloneDeep(astWithLocations).valueOf();
      try {
        interpreter = new Interpreter(sessionAst, initFunc);
      } catch (e) {
        displaySnackBarError('Interpreter error', e);
      }
    }
  }

  function nextStep(singleStep) {

    let delay = SequencerStore.getOptions().sequencerDelay * 3000;
    let maxAllowedReturnNodes =
      SequencerStore.getOptions().maxAllowedReturnNodes *
      SequencerStore.getOptions().maxAllowedReturnNodesFactor;
    let doneAction = false;
    let warning = null;
    if (CodeStatusStore.isCodeRunning()) {
      [doneAction, warning] =
      stateToNodeConverter.action(interpreter, maxAllowedReturnNodes);

      if (doneAction) {
        // console.log('this step actioned:');
      }
      // console.log(cloneDeep(interpreter.stateStack[0]));
      if (doneAction) {
        let representedNode = stateToNodeConverter.getRepresentedNode();
        SequencerStore.setStepOutput({
          // arrows are not drawn in ratio speed  if we're advancing one step at a time
          singleStep,
          execCodeBlock: astTools.createCode(representedNode),
            range: astTools.getCodeRange(representedNode),
            warning,
        });
        // wait until sequencer has completed timedout editor/d3
        // output before recursing, or show warning
        SequencerStore.sendUpdate().then(() => {
          if (!(warning && SequencerStore.getOptions().stopOnNotices)) {
            gotoNextStep();
          } else {
            CodeStatusStore.setCodeRunning(false);
          }
        });
      } else {
        // keep skipping forward until we see something
        // representing one of the actions that has
        // a visualization component built for it.
        // add timeout to relieve UI thread and allow
        // delay slider bar to operate
        gotoNextStep();
      }
    }

    function gotoNextStep() {
      try {
        if (interpreter.step()) {
          stateToNodeConverter.nextStep();
          if (doneAction && singleStep) {
            CodeStatusStore.setCodeRunning(false);
          } else {
            setTimeout(nextStep.bind(null, singleStep), (doneAction) ? delay : 0);
          }
        } else {
          CodeStatusStore.setCodeFinished(true);
          stateToNodeConverter.setFinished();
          SequencerStore.sendUpdate();
        }
      } catch (e) {
        // the interpreter may throw errors if you type
        // valid AST code but containing unknown identifiers
        // in deeper scopes.
        CodeStatusStore.setCodeFinished(true);
        displaySnackBarError('Interpreter error', e);
      }
    }
  }

  return {
    initialize: parseCodeAsIIFE,
    update: nextStep,
    restart: resetInterpreterAndSequencerStore,
  };

}
export default new Sequencer();
