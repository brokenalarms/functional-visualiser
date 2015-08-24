/* The UpdateStore stores settings that can be applied on-the-fly, including
    the currently executed code string. The visualizer and Editor subscribe
    to it directly. */

const event = require('events');

function UpdateStore() {
  const updateStore = Object.create(event.EventEmitter.prototype);

  const stateInt = {
    range: null,
    nodes: [],
    links: [],
    execCode: null,
    execCodeLine: null,
  };

  let liveOptions = {
    codeRunning: false,
    sequencer: {
      delay: 1000,
    },
  };

  let state = Object.assign({}, stateInt);

  function subscribeListener(callback) {
    updateStore.on('update', callback);
  }


  function resetState() {
    state = Object.assign({}, stateInt);
  }

  function unsubscribeListener(callback) {
    updateStore.removeListener('update', callback);
  }

  function getState() {
    return state;
  }

  function getLiveOptions() { 
    return liveOptions;
  }

  // sequencer controls this
  function sendUpdate() {
    updateStore.emit('update', state);
  }
  return {
    subscribeListener,
    unsubscribeListener,
    sendUpdate,
    getState,
    resetState,
    getLiveOptions,
  };
}

export default new UpdateStore;
