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
import Interpreter from '../vendor_mod/JS-Interpreter/interpreter.js';
import astTools from '../astTransforms/astTools.js';
import interpreterTools from './interpreterTools.js';
import {clone, cloneDeep} from 'lodash';

function Sequencer() {

  let interpreter;
  let astWithLocations;
  let nodes;
  let links;

  /* run once on code parse from editor. State can then be reset without re-parsing.
     Parsing will select user-written code once they have worked on/changed a preset example. */
  function parseCodeAsIIFE() {
    let codeString = (CodeStore.get()) ?
      CodeStore.get().toString().trim() :
      OptionStore.getOptions().staticCodeExample.toString().trim();

    let runFuncString;
    // check whether function is an immediately invokable function expression (IIFE)
    if (!(codeString.slice(0, 1) === '(' && codeString.slice(-3) === ')()')) {
      if (codeString.slice(-1) !== '}') {
        // allow for commands typed in directly without enclosing function
        runFuncString = `(function Program() { ${codeString} })()`;
      } else {
        // parse typed function as IIFE for interpreter
        runFuncString = '(' + codeString + ')()';
      }
    }

    astWithLocations = astTools.createAst(runFuncString, true);
    /* save back from AST to generated code and push that to the editor,
       so the dynamic selection of running code is still correct
       if any trivial syntactical differences exist between 
       the user's code and AST-generated code. */
    let execCode = astTools.createCode(astWithLocations);
    SequencerStore.getState().execCode = execCode;
    resetInterpreterAndSequencerStore();
  }

  /* resets interpreter and SequencerStore state to begin the program again,
     without re-parsing code. */
  function resetInterpreterAndSequencerStore() {
    SequencerStore.resetState();
    /* SequencerStore now has new node/link refs */
    nodes = SequencerStore.getState().nodes;
    links = SequencerStore.getState().links;
    // create deep copy so that d3 direct modifications are lost
    let sessionAst = cloneDeep(astWithLocations).valueOf();
    interpreter = new Interpreter(sessionAst);
    // prevent modifications to the editor from time of first update.
    LiveOptionStore.set({
      isCodeRunning: false,
    });
    // this enables the editor again (receives event without codeRunning)
    SequencerStore.sendUpdate();
  }


  let state;
  let prevState;
  let doneAction;

  function nextStep(singleStep) {

    if (singleStep || LiveOptionStore.isCodeRunning()) {
      doneAction = false;

      if (interpreter.step()) {
        // TODO - live adjustable options
        let sequencerOptions = LiveOptionStore.get().sequencer;
        let delay = sequencerOptions.delay;

        let sampleState = interpreter.stateStack[0];
        if (sampleState) {
          /* clone state to allow recursion.
             shallow clone of relevant nested objects is sufficent
             to give unique object reference for tracking,
             and avoid d3 duplicated values at root.
             Noticeably faster than just deepCloning the whole object. */
          state = {
            node: (sampleState.node) ? clone(sampleState.node).valueOf() : null,
            scope: (sampleState.scope) ? clone(sampleState.scope).valueOf() : null,
          };
          console.log(state);
          updateVisibleFunctionCalls(state, prevState, nodes, links);

          if (doneAction) {
            // TODO - prevState for enter, current state for leaving code
            SequencerStore.getState().range = interpreterTools.getCodeRange(prevState);
            SequencerStore.getState().execCodeBlock = astTools.createCode(prevState.node);
            SequencerStore.sendUpdate();
          }
          prevState = state;
        }
        if (!singleStep) {
          setTimeout(nextStep, (doneAction) ? delay : 0);
        } else if (singleStep && !doneAction) {
          setTimeout(nextStep.bind(null, singleStep), 0);
        }
      } else {
        resetInterpreterAndSequencerStore();
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
        addCallLink(state.node, prevState.node, nodes, links);
        /* Working from the start of the array mimics
           state stack and allows for representation of recursion. */
        nodes.unshift(state.node);
      } else if (interpreterTools.isExitingFunction(state, prevState, visibleScopes)) {
        let calleeName = interpreterTools.getExitingCalleeName(state);
        let visibleCallExpressionNode = visibleScopes.get(calleeName);
        removeCallLink(visibleCallExpressionNode, links);
        visibleScopes.delete(calleeName);
        doneAction = true;
        nodes.shift();
      }
    }
  }

  function addCallLink(callee, callExpressionNode, nodes, links) {
    if (nodes.length) {
      // linking from scope ('BlockStatement') to scope fo d3's representation
      let source = nodes[0];
      let target = callee;
      // keeping track of actual callExpressionNode node to match it on return
      links.unshift({
        source, target, callExpressionNode,
      });
    }
  }

  /* match by extra 'caller' node since this is the common base for
     comparison on entry and exit */
  function removeCallLink(callExpressionNode, links) {
    let index = null;
    links.some((link, i) => {
      index = i;
      return link.callExpressionNode === callExpressionNode;
    });
    links.splice(index, 1);
  }


  return {
    initialize: parseCodeAsIIFE,
    update: nextStep,
    restart: resetInterpreterAndSequencerStore,
  };
}

export default new Sequencer;
