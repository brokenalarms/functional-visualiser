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

  let delay = {
    staggerEditorAndVisualizer: true,
    sequencerDelay: 0.1, // * 1000 = ms, this is sliderValue
    delayFactor: 3000,
  };

  let editorOutput = {
    range: null,
    execCodeString: null,
    execCodeBlock: null,
  };

  function subscribeListener(callback) {
    sequencerStore.on('update', callback);
  }

  function subscribeEditor(callback) {
    sequencerStore.on('updateEditor', callback);
  }

  function unsubscribeListener(callback) {
    sequencerStore.removeListener('update', callback);
  }

  function unsubscribeEditor(callback) {
    sequencerStore.removeListener('updateEditor', callback);
  }

  function linkSequencerToD3Data() {
    return d3LinkedState;
  }

  function getEditorOutput() {
    return editorOutput;
  }

  function setEditorOutput(output) {
    Object.assign(editorOutput, output);
  }

  function setDelayOptions(delayOpts) {
    Object.assign(delay, delayOpts);
  }

  function getDelayOptions() {
    return delay;
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
    let stepDelay = delay.sequencerDelay * delay.delayFactor;
    return new Promise((resolveAll) => {


      if (delay.staggerEditorAndVisualizer) {
        // stagger code/visualizer steps evenly
        // to see cause/effect relationship.
        stepDelay = stepDelay / 2;

        let editorComplete = new Promise((resolveEditorStep) => {
          setTimeout(() => {
              sequencerStore.emit('updateEditor');
              resolveEditorStep(true);
            },
            stepDelay);
        });

        editorComplete.then(() => {
          setTimeout(() => {
            sequencerStore.emit('update');
            resolveAll(true);
          }, stepDelay);
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
    sendUpdate,
    linkState: linkSequencerToD3Data,
      getEditorOutput,
      setEditorOutput,
      setDelayOptions,
      getDelayOptions,
      resetState,
  };
}

export default new SequencerStore;
