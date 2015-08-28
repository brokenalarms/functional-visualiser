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
    showDelayBetweenEditorAndAction: true,
    sequencer: 10,
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

  function setDelay(newDelay) {
    delay.sequencer = newDelay;
  }

  function getDelay() {
    return delay.sequencer;
  }

  function resetState() {
    d3LinkedState.nodes = [];
    d3LinkedState.links = [];
    sendUpdate(true);
  }

  function sendUpdate(shouldResetD3) {
    let editorVisualizerGap = 0;
    if (delay.showDelayBetweenEditorAndAction) {
      editorVisualizerGap = delay.sequencer / 2;
    }
    let stepComplete = new Promise((resolve) => {
      sequencerStore.emit('updateEditor');
      setTimeout(function() {
          sequencerStore.emit('update', shouldResetD3);
          resolve(true);
        },
        editorVisualizerGap);
    });
    return stepComplete;
  }
  return {
    subscribeListener, subscribeEditor,
    unsubscribeListener, unsubscribeEditor,
    sendUpdate,
    linkState: linkSequencerToD3Data,
      getEditorOutput,
      setEditorOutput,
      setDelay,
      getDelay,
      resetState,
  };
}

export default new SequencerStore;
