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

    let runFuncString = codeString;
    // check whether function is an immediately invokable function expression (IIFE)
    // code gen makes '})();' into '}());' for some reason so this is covered
    // in the third branch
    if (!(codeString.slice(-1) === ')' || codeString.slice(-2) === ');' || codeString.slice(-4) === '());')) {
      if (!(codeString.slice(-1) === '}' || codeString.slice(-2) === '};')) {
        // allow for commands typed in directly without enclosing function
        runFuncString = `(function Program() { ${codeString} })();`;
      } else {
        // parse typed function as IIFE for interpreter
        runFuncString = '(' + codeString + ')();';
      }
    }

    astWithLocations = astTools.createAst(runFuncString, true);
    /* save back from AST to generated code and push that to the editor,
       so the dynamic selection of running code is still correct,
       as there are trivial but syntactically differences between 
       the user's code and AST-generated code before roundtrip. */
    SequencerStore.setEditorOutput({
      execCodeString: astTools.createCode(astWithLocations),
    });
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
      new FunctionCallChecker(SequencerStore.linkState().nodes,
        SequencerStore.linkState().links);
    /* create deep copy so that d3 root modifications
     and interpreter transformations are not maintained */
    let sessionAst = cloneDeep(astWithLocations).valueOf();
    interpreter = new Interpreter(sessionAst, initFunc);
  }

  function nextStep(singleStep) {

    if (LiveOptionStore.isCodeRunning()) {
      if (interpreter.step()) {
        // TODO - live adjustable options
        let sequencerOptions = LiveOptionStore.getOptions().sequencer;
        let delay = sequencerOptions.delay;

        console.log(cloneDeep(interpreter.stateStack[0]));
        let doneAction = updateNodes.action(interpreter.stateStack);
        if (doneAction) {
          let representedNode = updateNodes.getCodeSelectionNode();
          SequencerStore.setEditorOutput({
            execCodeBlock: astTools.createCode(representedNode),
            range: interpreterTools.getCodeRange(representedNode),
          });
          SequencerStore.sendUpdate();

          if (singleStep) {
            LiveOptionStore.setCodeRunning(false);
          } else {
            setTimeout(nextStep, (doneAction) ? delay : 0);
          }
        } else {
          // keep skipping forward until we see something
          setTimeout(nextStep.bind(null, singleStep), 0);
        }
        updateNodes.setPrevState();
      } else {
        resetInterpreterAndSequencerStore();
      }
    }
  }

  function FunctionCallChecker(resetNodes, resetLinks) {

    let nodes = resetNodes;
    let links = resetLinks;
    let state, prevState;

    function action(stateStack) {
      let doneAction = false;
      state = stateStack[0];
      if (state && prevState) {
        doneAction = (addCalledFunctions(state) ||
          removeExitingFunctions(state, stateStack)
        );
      }
      return doneAction;
    }

    function addCalledFunctions(state) {
      if (interpreterTools.isFunctionCall(state, prevState)) {
        let calleeName = prevState.node.callee.name || prevState.node.callee.id.name;

        // add extra info describing recursion
        if (nodes.length > 0) {
          let callerInfo = last(nodes).displayInfo;
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
        addCallLink(d3EnterNode, last(nodes));
        nodes.push(d3EnterNode);
        /* Tracking by scope reference allows for recursion:
           since the interpreter generates new scopes for each function,
           (and is synchronous). 
           Doing via a scope -> d3Node map rather than pushing the scope directly
           in order to leave the original scopes untouched,
           as the JS-interpreter interferes with d3-added tick values. */
        return true;
      }
      return false;
    }

    function removeExitingFunctions(state, stateStack) {
      if (interpreterTools.isReturnToCaller(state, prevState)) {
        links.pop();
        nodes.pop();
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

    function getCodeSelectionNode() {
      let codeSelectionNode = prevState.node;
      return codeSelectionNode;
    }

    function setPrevState() {
      if (state) {
        prevState = state;
      }
    }

    return {
      getCodeSelectionNode,
      setPrevState,
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
