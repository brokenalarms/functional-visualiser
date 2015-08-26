import OptionStore from '../stores/OptionStore.js';
import CodeStore from '../stores/CodeStore.js';
import LiveOptionStore from '../stores/LiveOptionStore.js';
import SequencerStore from '../stores/SequencerStore.js';
import Interpreter from '../vendor_mod/JS-Interpreter/interpreter.js';
import initFunc from '../jsInterpreterInit/jsInterpreterInit.js';
import astTools from '../astTransforms/astTools.js';
import interpreterTools from './interpreterTools.js';
import {clone, cloneDeep, find, remove, last} from 'lodash';

/* Sequencer, controlled by React ControlBar via SequencerStore store.
   Inteprets next state, updates SequencerStore and drives synchronized
   events to the Editor and visualizer underneath React. 

   Follows the initialise/update pattern as D3, as essentially
   this module performs a pre-processing of the interpreter results
   before each D3 forceLayout update.
*/
function Sequencer() {

  let interpreter;
  let astWithLocations;
  let updateNodes;

  /* run once on code parse from editor.
     State can then be reset without re-parsing.
     Parsing will select user-written code once
     they have worked on/changed a preset example. */
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
    // this enables the editor again after resetState event
    LiveOptionStore.setCodeRunning(false);
    SequencerStore.resetState();
    /* SequencerStore now has new node/link refs,
       update via function closure */
    updateNodes =
      new FunctionCallChecker(SequencerStore.getState().nodes,
        SequencerStore.getState().links);
    /* create deep copy so that d3 root modifications
     and interpreter transformations are not maintained */
    let sessionAst = cloneDeep(astWithLocations).valueOf();
    interpreter = new Interpreter(sessionAst, initFunc);
  }

  function nextStep(singleStep) {

    if (singleStep) {
      LiveOptionStore.setCodeRunning(true);
    }
    if (LiveOptionStore.isCodeRunning()) {
      if (interpreter.step()) {
        // TODO - live adjustable options
        let sequencerOptions = LiveOptionStore.getOptions().sequencer;
        let delay = sequencerOptions.delay;

        //console.log(cloneDeep(interpreter.stateStack[0]))
        let doneAction = updateNodes.action(interpreter.stateStack);
        if (doneAction) {
          // TODO - prevState for enter, current state for leaving code
          let representedNode = updateNodes.getCallerNode();
          SequencerStore.getState().range = interpreterTools.getCodeRange(representedNode);
          SequencerStore.getState().execCodeBlock = astTools.createCode(representedNode);
          SequencerStore.sendUpdate();
        }

        if (singleStep) {
          if (doneAction) {
            LiveOptionStore.setCodeRunning(false);
          } else {
            // keep skipping forward until we see something
            nextStep(singleStep);
          }
        } else {
          setTimeout(nextStep, (doneAction) ? delay : 0);
        }
      } else {
        resetInterpreterAndSequencerStore();
      }
    }
  }

  function FunctionCallChecker(resetNodes, resetLinks) {

    let nodes = resetNodes;
    let links = resetLinks;
    let prevState;
    let scopeChain = [];

    function action(stateStack) {
      let doneAction = false;
      let state = stateStack[0];
      if (state && prevState) {
        doneAction = (addCalledFunctions(state) ||
          removeExitingFunctions(state, stateStack)
        );
      }
      prevState = state;
      return doneAction;
    }

    function addCalledFunctions(state) {
      if (interpreterTools.isFunctionCall(state, prevState)) {
        let calleeName = prevState.node.callee.name || prevState.node.callee.id.name;

        // add extra info describing recursion
        if (scopeChain.length > 0) {
          let callerInfo = last(scopeChain).displayInfo;
          if (calleeName === callerInfo.calleeName) {
            calleeName = `${calleeName} (recursion ${++callerInfo.recursionCount})`;
          }
        }

        /* In JS, the parent scope for constructed functions is the global scope,
         even if they were constructed in some other scope. So I have to track
         my own 'parent' (callee) scope.*/
        let d3EnterNode = {
          displayInfo: {
            calleeName: calleeName,
            recursionCount: 0,
          },
        };
        nodes.push(d3EnterNode);
        addCallLink(d3EnterNode, last(scopeChain));
        /* Tracking by scope reference allows for recursion:
           since the interpreter generates new scopes for each function,
           (and is synchronous). 
           Doing via a scope -> d3Node map rather than pushing the scope directly
           in order to leave the original scopes untouched,
           as the JS-interpreter interferes with d3-added tick values. */
        scopeChain.push(d3EnterNode);
        return true;
      }
      return false;
    }

    function removeExitingFunctions(state, stateStack) {
      if (interpreterTools.isReturnToCaller(state, prevState)) {
        links.pop();
        nodes.pop();
        scopeChain.pop();
        return true;
      }
      return false;
    }

    function addCallLink(callee, caller) {
      if (caller && callee) {
        links.push({
          source: caller,
          target: callee,
        });
      }
    }

    return {
      getCallerNode: () => {
        return prevState.node;
      },
      action,
    };
  }

  return {
    initialize: parseCodeAsIIFE,
    update: nextStep,
    restart: resetInterpreterAndSequencerStore,
  };

}
export default new Sequencer;
