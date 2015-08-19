const event = require('events');


function UpdateStore() {
  const updateStore = Object.create(event.EventEmitter.prototype);

  const state = [];

  function subscribeListener(callback) {
    updateStore.on('update', callback);
  }

  function unsubscribeListener(callback) {
    updateStore.removeListener('update', callback);
  }

  function sendUpdate(newState) {
    state.push(newState);
    //Object.assign(state, newState);
    updateStore.emit('update', state);
  }
  return {
    subscribeListener,
    unsubscribeListener,
    sendUpdate,
  };
}

export default new UpdateStore;
