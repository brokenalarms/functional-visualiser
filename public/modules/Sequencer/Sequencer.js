/* Sequencer, controlled by React ControlBar via SequencerStore store.
   Inteprets next state, updates SequencerStore and drives synchronized
   events to the Editor and visualizer underneath React. 

   Follows the initialise/update pattern as D3, as essentially
   this module performs a pre-processing of the interpreter results
   before each D3 forceLayout update.
*/

import OptionStore from '../stores/OptionStore.js';
import CodeStore from '../stores/CodeStore.js';
import LiveOptionStore from '../stores/LiveOptionStore.js';
import SequencerStore from '../stores/SequencerStore.js';
import Interpreter from '../vendor/JS-Interpreter/interpreter.js';
import astTools from '../astTransforms/astTools.js';
import interpreterTools from './interpreterTools.js';
import {cloneDeep, last} from 'lodash';

function Sequencer() {

  let interpreter;
  let astWithLocations;

  // run once on code parse from editor. State can then be reset without re-parsing.
  function parseCode() {
    // prevent modifications to the editor from time of first update.
    SequencerStore.getState().codeRunning = true;
    let codeString = (CodeStore.get()) ?
      CodeStore.get().toString() : OptionStore.getOptions().staticCode.toString();

    // allow for commands typed in directly without enclosing function
    let funcString = (codeString.slice(-1) !== '}') ?
      `function runWrapper() { ${codeString} }` : codeString;
    // parse typed code string as function expression for interpreter
    let runFuncString = (funcString.slice(0, 1) === '(' && funcString.slice(-3) === ')()') ?
      funcString : '(' + funcString + ')()';
    astWithLocations = astTools.createAst(runFuncString, true);
    /* save back from AST to generated code and push that to the editor,
       so the dynamic selection of running code is still correct
       if any trivial syntactical differences exist between 
       the user's code and AST-generated code. */
    let execCode = astTools.createCode(astWithLocations);
    SequencerStore.getState().execCode = execCode;
    restartInterpreter();
  }

  /* resets interpreter and SequencerStore state to begin the program again,
     without re-parsing code. */
  function restartInterpreter() {
    SequencerStore.resetState();
    interpreter = new Interpreter(astWithLocations);
  }

  /* Direct access by reference so the d3 forceLayout can track
  added/removed nodes on reset. The SequencerStore is just a helper dispatcher
   for the Sequencer so this coupling is OK. */
  let nodes = SequencerStore.getState().nodes;
  let links = SequencerStore.getState().links;


  let state;
  let prevState;
  let doneAction;

  function update(singleStep) {

    if (singleStep || SequencerStore.getState().codeRunning) {
      doneAction = false;

      if (interpreter.step()) {
        // TODO - live adjustable options
        let sequencerOptions = LiveOptionStore.getOptions().sequencer;
        let delay = sequencerOptions.delay;

        state = interpreter.stateStack[0];
        if (state) {
          console.log(state);
          updateVisibleFunctionCalls(state, prevState, nodes, links);

          if (doneAction) {
            // TODO - prevState for enter, current state for leaving code
            SequencerStore.getState().range = interpreterTools.getCodeRange(prevState);
            SequencerStore.getState().execCodeLine = astTools.createCode(prevState.node);
            SequencerStore.sendUpdate();
          }
          prevState = state;
        }
        if (!singleStep) {
          setTimeout(update, (doneAction) ? delay : 0);
        } else if (singleStep && !doneAction) {
          setTimeout(update.bind(null, singleStep), 0);
        }
      } else {
        SequencerStore.resetState();
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
    initialize: parseCode,
    update,
    restart: restartInterpreter,
  };

}

export default new Sequencer;
