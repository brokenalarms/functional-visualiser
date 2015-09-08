/* The SequencerStore stores d3LinkedState related to the Sequencer, including
    the currently executed code string.
    It dispatches to the Visualizer and Code Editor.
    Update is controlled by the Sequencer, when
    d3 and the editor both have the relevant info
    the store manages the timing offset for both events
    (showing the code interpreted, then the visualized result.) */

const event = require('events');

function SequencerStore() {
  const sequencerStore = Object.create(event.EventEmitter.prototype);

  let d3LinkedState = {
    nodes: [],
    links: [],
  };

  let options = {
    staggerEditorAndVisualizer: true,
    visualizerPercentageOfDelay: 2 / 3,
    limitReturnedNodes: true,
    maxAllowedReturnNodes: 0.5,
    maxAllowedReturnNodesFactor: 40,
    sequencerDelay: 0.01, // * 1000 = ms, this is sliderValue
    minSequencerDelay: 0.01,
    delayFactor: 3000,
    singleStep: false,
  };

  let stepOutput = {
    range: null,
    execCodeBlock: null,
    warning: null,
  };

  let warningsHistory = [];

  function subscribeListener(callback) {
    sequencerStore.on('update', callback);
  }

  function unsubscribeListener(callback) {
    sequencerStore.removeListener('update', callback);
  }

  function subscribeEditor(callback) {
    sequencerStore.on('updateEditor', callback);
  }

  function unsubscribeEditor(callback) {
    sequencerStore.removeListener('updateEditor', callback);
  }

  function subscribeOptionListener(callback) {
    sequencerStore.on('optionsChanged', callback);
  }

  function unsubscribeOptionListener(callback) {
    sequencerStore.removeListener('optionsChanged', callback);
  }

  function linkSequencerToD3Data() {
    return d3LinkedState;
  }

  function getCurrentRange() {
    return stepOutput.range;
  }

  function getCurrentCodeBlock() {
    return stepOutput.execCodeBlock;
  }

  function setStepOutput(output) {
    Object.assign(stepOutput, output);
    if (output.warning) {
      warningsHistory.push(output.warning);
    }
    
  }

  function setOptions(newOpts) {
    Object.assign(options, newOpts);
    sequencerStore.emit('optionsChanged', options);
  }

  function getOptions() {
    return options;
  }

  function getWarning() {
    return stepOutput.warning;
  }

  function setWarningMessageShown() {
    stepOutput.warning = null;
  }

  function resetState() {
    d3LinkedState.nodes = [];
    d3LinkedState.links = [];
    sendUpdate(true);
  }

  function sendUpdate(shouldResetD3) {

    if (shouldResetD3) {
      sequencerStore.emit('updateEditor');
      sequencerStore.emit('update', shouldResetD3);
      return;
    }
    let stepDelay = options.sequencerDelay * options.delayFactor;
    return new Promise((resolveAll) => {


      if (options.staggerEditorAndVisualizer) {
        // stagger code/visualizer steps evenly
        // to see cause/effect relationship.
        let editorComplete = new Promise((resolveEditorStep) => {
          setTimeout(() => {
              sequencerStore.emit('updateEditor');
              resolveEditorStep(true);
            },
            stepDelay * (1 - options.visualizerPercentageOfDelay));
        });

        editorComplete.then(() => {
          setTimeout(() => {
            sequencerStore.emit('update');
            resolveAll(true);
          }, stepDelay * options.visualizerPercentageOfDelay);
        });

      } else {
        // run both events synchronously at the
        // end of the stepDelay the return
        setTimeout(() => {
          sequencerStore.emit('update');
          sequencerStore.emit('updateEditor');
          resolveAll(true);
        }, stepDelay);
      }
    });
  }


  return {
    subscribeListener, subscribeEditor,
    unsubscribeListener, unsubscribeEditor,
    subscribeOptionListener, unsubscribeOptionListener,
    sendUpdate,
    linkState: linkSequencerToD3Data,
      getCurrentRange,
      getCurrentCodeBlock,
      setStepOutput,
      getWarning,
      setWarningMessageShown,
      setOptions,
      getOptions,
      resetState,
  };
}

export default new SequencerStore;
