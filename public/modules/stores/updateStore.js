const event = require('events');


function UpdateStore() {
  const updateStore = Object.create(event.EventEmitter.prototype);

  const state = {
    range: {},
  };

  function subscribeListener(callback) {
    updateStore.on('update', callback);
  }

  function unsubscribeListener(callback) {
    updateStore.removeListener('update', callback);
  }

  function getState() {
    return state;
  }

  function updateState(newOpts) {
    Object.assign(state, newOpts);
    //state.push(newState);
    updateStore.emit('update', state);
  }
  return {
    subscribeListener,
    unsubscribeListener,
    updateState,
    getState,
  };
}

export default new UpdateStore;
