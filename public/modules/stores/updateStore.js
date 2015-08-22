const event = require('events');


function UpdateStore() {
  const updateStore = Object.create(event.EventEmitter.prototype);

  let state = {
    range: {},
    nodes: [],
    links: [],
  };

  function subscribeListener(callback) {
    updateStore.on('update', callback);
  }


  function resetState() {
    state = {
      range: {},
      nodes: [],
      links: [],
    };
  }

  function unsubscribeListener(callback) {
    updateStore.removeListener('update', callback);
  }

  function getState() {
    return state;
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
  };
}

export default new UpdateStore;
