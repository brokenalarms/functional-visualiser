const event = require('events');


function UpdateStore() {
  const updateStore = Object.create(event.EventEmitter.prototype);

  const state = Object.create({}, {
    newNodes: [],
    newLinks: [],
    // probably just get all each time, or use stateStack?
  });

  function subscribeListener(callback) {
    updateStore.on('update', callback);
  }

  function unsubscribeListener(callback) {
    updateStore.removeListener('update', callback);
  }

  function sendUpdate(newState) {
    Object.assign(state, newState);
    updateStore.emit('update');
  }
  return {
    subscribeListener,
    unsubscribeListener,
    sendUpdate,
  };
}

export default new UpdateStore;
