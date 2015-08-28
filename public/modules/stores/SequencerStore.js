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
    staggeEditorAndVisualizer: true,
    sequencerDelay: 1000,
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

  // synchronise code/visualizer steps or
  // stagger them evenly to see cause/effect
  // relationship.
  function sendUpdate(shouldResetD3) {
    let editorVisualizerGap = 0;
    if (delay.delayBetweenEditorAndAction) {
      editorVisualizerGap = delay.sequencer / 2;
    }

    let editorComplete = new Promise((resolve) => {
      setTimeout(() => {
          sequencerStore.emit('updateEditor');
          resolve(true);
        },
        editorVisualizerGap);
    });

    editorComplete.then(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          sequencerStore.emit('update', shouldResetD3);
          resolve(true);
        }, editorVisualizerGap);
      });
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
