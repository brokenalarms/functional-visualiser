import OptionStore from '../stores/OptionStore.js';
import UpdateStore from '../stores/UpdateStore.js';
import Interpreter from '../vendor/JS-Interpreter/interpreter.js';
import astTools from '../astTransforms/astTools.js';

import cloneDeep from 'lodash';
import UUID from 'uuid-js';

function Sequencer() {

  function initFunc(interpreter, scope) {
    interpreter.setProperty(scope, 'return', function() {
      console.log('return found');
    });
  }

  let doneAction = false;

  function start() {
    let codeString = OptionStore.getOptions().selectedCode;
    let runString = '(' + codeString + ')()';
    let astWithLocations = astTools.createAst(runString, true);
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
          UpdateStore.getState().range = getCodeRange(state);
          UpdateStore.sendUpdate();
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
      if (isFunctionCall(state, prevState)) {
        doneAction = true;
        state.scope.caller = prevState;
        let d3Node = state.node;
        let name = prevState.node.callee.name || prevState.node.callee.id.name;
        visibleScopes.set(name, prevState.node);
        d3Node.d3Info = {
          name,
        };
        nodes.push(d3Node);
      } else if (isExitingFunction(state, prevState)) {
        let calleeName = getExitingCalleeName(state, prevState);
        visibleScopes.delete(calleeName);
        doneAction = true;
        nodes.pop();
      }
    }
  }

  function isFunctionCall(state, prevState) {
    return (state.scope && prevState.node &&
      prevState.node.type === 'CallExpression');
  }

  function isReturnToCallee(state, prevState) {
    return ((prevState.node.type === 'ReturnStatement' || prevState.scope) &&
      state.node.type === 'CallExpression');
  }

/*  function isEndOfExpressionStatement(state, prevState) {
    return (state.node.type === 'ExpressionStatement' &&
      state.done);
  }*/

  function getExitingCalleeName(state, prevState) {
    // now assuming we have either a valid callee exit or end of expressionStatement
    return (isReturnToCallee(state, prevState)) ?
      state.node.callee.name : state.node.expression.callee.id.name;
  }

  function isExitingFunction(state, prevState) {
    let returnToCallee = isReturnToCallee(state, prevState);
    let endOfExpressionStatement = isEndOfExpressionStatement(state, prevState);
    if (returnToCallee || endOfExpressionStatement) {
      // we have transformed the function call into a literal result
      let calleeName = getExitingCalleeName(state, prevState);
      return (visibleScopes.has(calleeName) &&
        visibleScopes.get(calleeName) === state.node);
    }
    return false;
  }

  function getCodeRange(state) {
    if (state.node) {
      let loc = state.node.loc;
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
