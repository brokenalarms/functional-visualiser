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
    delayVisualizer: true,
    savedSequencerDelay: null,
    staggerEditorAndVisualizer: true, // not user adjustable, it's better like this
    visualizerPercentageOfDelay: 0.6,
    limitReturnedNodes: true,
    maxAllowedReturnNodes: 0.6,
    maxAllowedReturnNodesFactor: 100,
    sequencerDelay: 0.5, // * 1000 = ms, this is sliderValue
    minSequencerDelay: 0.01,
    delayFactor: 2000,
    stopOnNotices: true,
    showFunctionLabels: true,
    highlightExecutedCode: true,
  };

  let stepOutput = {
    range: null,
    execCodeBlock: null,
    warning: null,
    singleStep: false,
  };

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

  function isSingleStep() {
    return stepOutput.singleStep;
  }

  function setStepOutput(output) {
    Object.assign(stepOutput, output);
  }

  function setSavedDelay() {
    if (!options.delayVisualizer) {
      options.savedSequencerDelay = options.sequencerDelay;
      options.sequencerDelay = options.minSequencerDelay;
    } else {
      options.sequencerDelay = options.savedSequencerDelay;
      options.savedSequencerDelay = null;
    }
  }

  function setOptions(newOpts) {
    Object.assign(options, newOpts);
    if (newOpts.delayVisualizer !== undefined) {
      setSavedDelay();
    }
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
      if (options.highlightExecutedCode) {
        sequencerStore.emit('updateEditor');
      }
      sequencerStore.emit('update', shouldResetD3);
      return;
    }
    let stepDelay = options.sequencerDelay * options.delayFactor;
    return new Promise((resolveAll) => {


      if (options.staggerEditorAndVisualizer) {
        // stagger code/visualizer steps evenly
        // to see cause/effect relationship.
        let editorComplete = new Promise((resolveEditorStep) => {
          if (options.highlightExecutedCode) {
            sequencerStore.emit('updateEditor');
          }
          setTimeout(() => {
              resolveEditorStep(true);
            },
            stepDelay * (1 - options.visualizerPercentageOfDelay));
        });

        editorComplete.then(() => {
          sequencerStore.emit('update');
          setTimeout(() => {
            resolveAll(true);
          }, stepDelay * options.visualizerPercentageOfDelay);
        });

      } else {
        // run both events synchronously at the
        // end of the stepDelay the return
        sequencerStore.emit('update');
        if (options.highlightExecutedCode) {
          sequencerStore.emit('updateEditor');
        }
        setTimeout(() => {
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
      isSingleStep,
      getWarning,
      setWarningMessageShown,
      setOptions,
      getOptions,
      resetState,
  };
}

export default new SequencerStore;
