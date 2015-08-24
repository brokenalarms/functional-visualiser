/* The SequencerStore stores state related to the Sequencer, including
    the currently executed code string. It dispatches to the Visualizer and Code Editor. */

const event = require('events');

function SequencerStore() {
  const sequencerStore = Object.create(event.EventEmitter.prototype);

  const stateInt = {
    range: null,
    codeRunning: false,
    execCode: null,
    execCodeLine: null,
  };

  let state = Object.assign({}, stateInt);
  state.nodes = [];
  state.links = [];

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
    // d3 needs the same array reference for updating to work
    // without re-rendering via React
    state.nodes.length = 0;
    state.links.length = 0;
    Object.assign(state, stateInt);
    sendUpdate();
  }

  // sequencer controls this
  function sendUpdate() {
    sequencerStore.emit('update', state);
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
