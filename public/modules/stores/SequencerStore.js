/* The SequencerStore stores state related to the Sequencer, including
    the currently executed code string.
    It dispatches to the Visualizer and Code Editor. */

const event = require('events');

function SequencerStore() {
  const sequencerStore = Object.create(event.EventEmitter.prototype);

  let state = {
    nodes: [],
    links: [],
    range: null,
    execCode: null,
    execCodeBlock: null,
  };

  function subscribeListener(callback) {
    sequencerStore.on('update', callback);
  }

  function unsubscribeListener(callback) {
    sequencerStore.removeListener('update', callback);
  }

  function getState() {
    return state;
  }

  function resetState() {
    state.nodes = [];
    state.links = [];
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
    getState,
    resetState,
  };
}

export default new SequencerStore;
