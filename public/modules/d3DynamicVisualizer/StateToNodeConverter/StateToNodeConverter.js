// =============================================
// Pre-processing for dynamic D3 visualization.
// Analyzes js-interpreter results to 
// infer adding and removing nodes
// for use by D3.
// Initiated by the Sequencer, and returns
// whether the Sequencer should consider the
// current state of the interpreter as constituting
// a display update step.
// =============================================

import {last} from 'lodash';
// import formatOutput from '../d3DynamicVisualizer/formatOutput.js';
import DisplayTextHandler from './DisplayTextHandler/DisplayTextHandler.js';
import StringTokenizer from './DisplayTextHandler/StringTokenizer/StringTokenizer.js';
import ErrorChecker from './ErrorChecker/ErrorChecker.js';

function StateToNodeConverter(resetNodes, resetLinks) {

  // these variables are all modified by the
  // add, remove and update helpers, though all variables
  // explicit to only the controllers for each of those 
  // are passed explicitly
  let nodes = resetNodes;
  let links = resetLinks;
  // responsible for handling string tokenization and update
  let displayTextHandler = new DisplayTextHandler();
  let errorChecker = new ErrorChecker();
  // use custom link index for d3 links and nodes, as otherwise they do not
  // re-associate reliably on popping off the end of the array and shifting
  // onto the front .
  let linkIndex = 0;
  // used to track current and previous interpreter state, 
  // to make inferences about what is happening. Try to limit use
  // of prevState.
  let state;
  let prevState;

  // track the current depth of the scope chain
  // - by d3 node, not interpreter scope.
  let scopeChain = [];

  // index of errorCount tracked here is passed to d3 for angry colours.
  let rootNode = null;

  // as we start to return nodes, we pop them off the array
  // and unshift them onto the front. The oldest returning nodes
  // that can therefore be removed once the maxAllowedReturnNodes
  // limit is exceeded are those immediately behind the rootNodeIndex.
  let rootNodeIndex = 0;

  // this is assigned if returning to a callExpression;
  // the next state is then checked to ensure that the
  // return result is assigned back to a variable.
  let exitingNode = null;

  // ===============================================
  // Main action method. Runs add, remove and update
  // checks and returns warnings and updates for display.
  // Will short-circuit other checks if one satisfies
  // condition - Sequencer can only show entering,
  // exiting or updating step for a single interpreter step/state.
  // ===============================================
  function action(interpreter, maxAllowedReturnNodes) {
    let nodeEnterOrExit = false;
    let functionReturnUnassigned = false;
    let currentNodeUpdated = false;
    let variableErrors = false;
    let currentWarning = null;
    state = interpreter.stateStack[0];

    if (state) {
      nodeEnterOrExit = (
        isNodeEntering(state, interpreter) ||
        isNodeExiting(state, interpreter, maxAllowedReturnNodes)
      );


      let updateNode = last(scopeChain) || null;

      if (!nodeEnterOrExit && updateNode) {
        if (exitingNode) {
          // make sure the returned function is 
          // then assigned to a variable
          functionReturnUnassigned =
            isFunctionReturnUnassigned(state, updateNode, exitingNode);
        }
        currentNodeUpdated =
          displayTextHandler.doesDisplayNameNeedUpdating(state, updateNode, interpreter);
        variableErrors = errorChecker.isVariableMutated(state, updateNode);
      }
    }
    if (rootNode) {
      [rootNode.errorCount, currentWarning] =
      errorChecker.getErrorCountAndCurrentWarning();
    }
    return [
      (nodeEnterOrExit || functionReturnUnassigned ||
        variableErrors || currentNodeUpdated),
      currentWarning,
    ];
  }

  function getCallLink(source, target, linkState) {
    if (source && target) {
      let callLink = {
        source: source,
        target: target,
        linkState,
        linkIndex: linkIndex++,
      };
      return callLink;
    }
  }

  /**
   * [isNodeEntering - checks to see if new nodes need to be added]
   * links have linkState: calling and returning
     nodes have type: root, normal or finished
     nodes additionally have status: neutral, notice, warning, failure or finished 
   */
  function isNodeEntering(state, interpreter) {
    let updateNeeded = false;

    function isSupportedFunctionCall(state) {
      // won't show stepping into and out of member methods (e.g array.slice)
      // because these are built-ins with black-boxed code.
      // User functions may also be object properties, but I am not considering
      // this for this exercise.
      return (
        (state.node.type === 'CallExpression' && !state.doneCallee_) &&
        !(state.node.callee && state.node.callee.type === 'MemberExpression')
      );
    }

    if (isSupportedFunctionCall(state)) {

      let enterNode = {
        name: state.node.callee.name || state.node.callee.id.name,
        parentNode: last(scopeChain) || null,
        paramNames: [],
        interpreterComputedArgs: [],
        // variable information and warnings 
        // populated once the interpreter
        // generates scope
        variablesDeclaredInScope: null,
        warningsInScope: new Set(),
        type: 'function',
        status: 'normal',
      };

      // set up string tokens for display text
      enterNode.recursion = (
        enterNode.parentNode && enterNode.name === enterNode.parentNode.name);
      enterNode.displayTokens =
        StringTokenizer.getInitialDisplayTokens(
          enterNode.name, state.node.arguments, enterNode.parentNode, interpreter);
      enterNode.displayName =
        StringTokenizer.joinAndFormatDisplayTokens(enterNode.displayTokens, enterNode.recursion);


      // the root node carries through information to d3 about overall progress.
      if (nodes.length === 0) {
        enterNode.type = 'root';
        enterNode.errorCount = 0;
        enterNode.status = 'success';
        rootNode = enterNode;
      }

      // add nodes and links to d3
      nodes.push(enterNode);
      let callLink = getCallLink(enterNode.parentNode, enterNode, 'calling');
      if (callLink) {
        links.push(callLink);
      }

      /* Tracking by scope reference allows for
      displaying nested functions and recursion */
      scopeChain.push(enterNode);
      updateNeeded = true;
    }
    return updateNeeded;
  }

  // ===================
  // Exiting controller
  // ===================
  function isNodeExiting(state, interpreter, maxAllowedReturnNodes) {
    let updateNeeded = false;

    if (isSupportedReturnToCaller(state)) {
      // we'll check on this on future runs
      //  to make sure its result is assigned to a variable 
      exitingNode = last(scopeChain);

      if (exitingNode !== rootNode) {
        let link = last(links) || null;
        if (link) {
          // don't want to come full circle and break links outgoing from root
          exitLink(link);
          exitNode(exitingNode);
          updateNeeded = true;
          scopeChain.pop();
        }
      } else {
        // we're at the root scope, there can't be a node exiting
        // unless the program is finishing
        exitingNode = null;
        rootNode.status = 'finished';
      }

      if (rootNodeIndex > maxAllowedReturnNodes) {
        // the returned nodes shifted to the front of the array
        // has exceeded the limit; start removing the oldest
        // from the root node position backwards 
        removeOldestReturned(nodes, links, maxAllowedReturnNodes);
        updateNeeded = true;
      }

    }
    return updateNeeded;
  }

  // =========================
  // Exiting helpers
  // =========================
  function isSupportedReturnToCaller(state) {
    return (
      (state.node.type === 'CallExpression' && state.doneExec) &&
      !(state.node.callee && state.node.callee.type === 'MemberExpression')
    );
  }

  function exitLink(link) {
    // change directions and class on returning functions
    // nodes are about to be 'flipped' for return so target
    // is the exiting link
    let nodeReturning = link.target;

    if (errorChecker.doesFunctionReturn(
        state, nodeReturning)) {
      // reverse source and target to flip arrows and animation
      let returnLink = getCallLink(
        link.target, link.source, 'returning');
      links.unshift(returnLink);
    }
    // break the chain for non-returned functions!
    links.pop();
  }


  function findReturnIdentifier(node, index) {

    return prevState.node.argument[index];
  }

  function exitNode(node) {
    let returnValue = null;

    // interpreter provides result
    if (state.doneCallee_ && state.doneExec) {
      if (state.value.isPrimitive) {
        returnValue = StringTokenizer.formatSingleToken({
          value: state.value.data,
          type: state.value.type,
        });
      } else if (state.value.type === 'function') {
        returnValue = StringTokenizer.joinAndFormatDisplayTokens(node.displayTokens);
      } else if (state.value.type === 'object') {
        if (state.n_) {
          let returningArgIndex = state.n_ - 1;
          if (node.interpreterComputedArgs[returningArgIndex] !== undefined) {
            returnValue = StringTokenizer.formatSingleToken({
              value: node.interpreterComputedArgs[returningArgIndex].value,
              type: state.value.type,
            });
          } else {
            returnValue = StringTokenizer.formatSingleToken({
              value: 'object',
              type: 'object',
            });
          }
        }
      }
    }
    node.displayName = `return (${returnValue})`;
    node.updateText = true;

    // move exiting node to the front of the queue and increase the marker
    // - the oldest nodes that can be removed if maxAllowedNodes are exceeded
    // fall directly before the rootNodeIndex.
    nodes.pop();
    nodes.unshift(node);
    rootNodeIndex++;
  }

  function nodeIsBeingAssigned(node) {
    return (node.type === 'ReturnStatement' ||
      node.type === 'VariableDeclarator' ||
      node.type === 'VariableDeclaration' ||
      node.type === 'BinaryExpression' ||
      node.type === 'AssignmentExpression'
    );
  }

  function nodeWillBeAssigned(state) {
    let node = state.node;
    let expressionAssigned = (node.type === 'ExpressionStatement' &&
      nodeIsBeingAssigned(node.expression));

    let callNotFinished = (node.type === 'CallExpression' && !state.doneExec);

    let argIndex = state.n_;
    let variableWillBeAssignedInScope = true;
    if (argIndex !== undefined) {
      variableWillBeAssignedInScope =
        (node.type === 'BlockStatement' &&
          (
            nodeIsBeingAssigned(node.body[argIndex - 1]) ||
            nodeWillBeAssigned(node.body[argIndex - 1])
          )
        );

      return (expressionAssigned || variableWillBeAssignedInScope || callNotFinished);
    }
    return expressionAssigned;
  }

  function isFunctionReturnUnassigned(state) {
    let conditionMet = false;
    // used to track an exit node to the next state, and ensure that
    // a returning function is being or will be (likely) assigned to a variable:
    // if the state progresses too far past the return then this potential error
    // just abandoned as it becomes increasingly unreliable to infer.
    if (!(nodeIsBeingAssigned(state.node) || nodeWillBeAssigned(state))) {
      errorChecker.addUnassignedFunctionWarning(exitingNode.parentNode, exitingNode);

      if (links[0] && links[0].source === exitingNode) {
        // break off this link too..but only if the returning link
        // (pointing back from target to source, and shifted back 
        // onto the front of the links array)
        // hasn't already been removed because the function didn't have a return statement
        links.shift();
      }
      conditionMet = true;
    }
    // there will likely be other conditions where the node is being unassigned,
    // but it is getting hard to infer now and so best to prevent the warning then
    // to show it as a false positive
    exitingNode = null;
    return conditionMet;
  }

  function removeOldestReturned(nodes, links, maxAllowedReturnNodes) {
    // cannot remove so many nodes that the root node onwards would be deleted
    // (i.e, only returning nodes shifted to the start of the array
    //  are eligible for deletion)
    //  this may not always be simply 1, since the user can adjust
    //  the maxAllowedReturnNodes on the fly which could lead to
    //  many nodes needing removal on the next Sequencer step
    let itemsToRemoveCount = rootNodeIndex - maxAllowedReturnNodes;
    let removalStartIndex = rootNodeIndex - itemsToRemoveCount;
    // links always have one less item than nodes
    // (root node has no calling link attached)
    // the indexes match on the way back,
    // except we don't want to also try and remove
    // a link when there is only one node
    if (nodes.length > 1) {
      links.splice(removalStartIndex, itemsToRemoveCount);
    }
    nodes.splice(removalStartIndex, itemsToRemoveCount);
    rootNodeIndex -= itemsToRemoveCount;
  }

  // ====================================
  // Functions used by Sequencer to setup
  // the VisibleFunctionsUpdater for its
  // next run, 
  // before and after it displays a step 
  // ====================================

  function getRepresentedNode() {
    if (prevState.node.type === 'ReturnStatement') {
      return prevState.node;
    }
    return state.node;
  }

  function setPrevState() {
    if (state) {
      prevState = state;
    }
  }

  return {
    nextStep: setPrevState,
    action,
    getRepresentedNode,
  };
}

export default StateToNodeConverter;
