/* Sequencer, controlled by React ControlBar via UpdateStore store.
   Inteprets next state, updates UpdateStore and drives synchronized
   events to the Editor and visualizer underneath React. 

   Follows the initialise/update pattern as D3, as essentially
   this module performs a pre-processing of the interpreter results
   before each D3 forceLayout update.
*/

import OptionStore from '../stores/OptionStore.js';
import UpdateStore from '../stores/UpdateStore.js';
import Interpreter from '../vendor/JS-Interpreter/interpreter.js';
import astTools from '../astTransforms/astTools.js';
import interpreterTools from './interpreterTools.js';
import {cloneDeep, last} from 'lodash';

function Sequencer() {

  let interpreter, nodes, links;

  function initialize() {

    // direct access so the d3 forceLayout can track added/removed nodes
    nodes = UpdateStore.getState().nodes;
    links = UpdateStore.getState().links;

    // prevent modifications to the editor from time of first update
    UpdateStore.getLiveOptions().codeRunning = true;

    // parse typed code string as function expression for interpreter
    let codeString = OptionStore.getOptions().staticCode.toString();
    let runString = (codeString.slice(0, 1) === '(' && codeString.slice(-3) === ')()') ?
      codeString : '(' + codeString + ')()';
    let astWithLocations = astTools.createAst(runString, true);
    let execCode = astTools.createCode(astWithLocations);
    /* save back so the dynamic selection range is correct
       if any trivial syntactical differences exist between 
       the user's code and ast-generated code. */
    UpdateStore.getState().execCode = execCode;
    interpreter = new Interpreter(astWithLocations);
  }

  let state, prevState, doneAction;

  function update(singleStep) {

    if (UpdateStore.getLiveOptions().codeRunning) {
      doneAction = false;

      // TODO - live adjustable options
      let sequencerOptions = UpdateStore.getLiveOptions().sequencer;
      let delay = sequencerOptions.delay;

      state = interpreter.stateStack[0];
      if (state) {
        console.log(state);
        updateVisibleFunctionCalls(state, prevState, nodes, links);

        if (doneAction) {
          // TODO - prevState for enter, current state for leaving code
          UpdateStore.getState().range = interpreterTools.getCodeRange(prevState);
          UpdateStore.getState().execCodeLine = astTools.createCode(prevState.node);
          UpdateStore.sendUpdate();
        }
        prevState = state;
      }

      if (!singleStep && interpreter.step()) {
        setTimeout(update, (doneAction) ? delay : 0);
      } else {
        UpdateStore.getLiveOptions().codeRunning = false;
        UpdateStore.sendUpdate();
      }
    }
  }

  /* stores CallExpression node as shared point for object equality comparison
     on entry and exit (prevState.node on entry, state.node on exit */
  let visibleScopes = new Map();

  function updateVisibleFunctionCalls(state, prevState, nodes, links) {
    if (prevState) {
      if (interpreterTools.isFunctionCall(state, prevState)) {
        doneAction = true;
        state.scope.caller = prevState;
        let name = prevState.node.callee.name || prevState.node.callee.id.name;
        visibleScopes.set(name, prevState.node);
        state.node.d3Info = {
          name,
        };
        addCallLink(state.node, nodes, links);
        nodes.push(state.node);
      } else if (interpreterTools.isExitingFunction(state, prevState, visibleScopes)) {
        let calleeName = interpreterTools.getExitingCalleeName(state);
        let visibleCallExpressionNode = visibleScopes.get(calleeName);
        removeCallLink(visibleCallExpressionNode, links);
        visibleScopes.delete(calleeName);
        doneAction = true;
        nodes.pop();
      }
    }
  }

  function addCallLink(d3Node, nodes, links) {
    if (nodes.length) {
      let source = last(nodes);
      let target = d3Node;
      links.push({
        source, target,
      });
    }
  }

  function removeCallLink(visibleCallExpressionNode, links) {
    let index = null;
    links.some((link, i) => {
      index = i;
      return link.source.node === visibleCallExpressionNode;
    });
    links.splice(index, 1);
  }


  return {
    initialize,
    update,
  };

}

export default new Sequencer;
