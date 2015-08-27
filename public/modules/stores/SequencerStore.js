/* The SequencerStore stores d3LinkedState related to the Sequencer, including
    the currently executed code string.
    It dispatches to the Visualizer and Code Editor.
    Update is controlled by the Sequencer, when
    d3 and the editor both have the relevant info
    a single event is sent to both. */

const event = require('events');

function SequencerStore() {
  const sequencerStore = Object.create(event.EventEmitter.prototype);

  let d3LinkedState = {
    nodes: [],
    links: [],
  };

  let editorOutput = {
    range: null,
    execCodeString: null,
    execCodeBlock: null,
  };

  function subscribeListener(callback) {
    sequencerStore.on('update', callback);
  }

  function unsubscribeListener(callback) {
    sequencerStore.removeListener('update', callback);
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

  function resetState() {
    d3LinkedState.nodes = [];
    d3LinkedState.links = [];
    sendUpdate(true);
  }

  // sequencer controls this
  function sendUpdate(shouldResetD3) {
    sequencerStore.emit('update', shouldResetD3);
  }
  return {
    subscribeListener,
    unsubscribeListener,
    sendUpdate,
    linkState: linkSequencerToD3Data,
      getEditorOutput,
      setEditorOutput,
      resetState,
  };
}

export default new SequencerStore;
