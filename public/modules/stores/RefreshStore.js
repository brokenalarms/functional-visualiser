/* Stores those options relating
   to both the Editor and D3Visualizer
   that require a React component
   refresh to put into effect.*/

const event = require('events');

function RefreshStore() {
  const refreshStore = Object.create(event.EventEmitter.prototype);
  const options = {};

  Object.assign(options, {
    showDynamic: true,
    dimensions: {
      width: 1000,
      height: 56 + 800,
    },
  });

  function subscribeListener(callback) {
    refreshStore.on('change', callback);
  }

  function unsubscribeListener(callback) {
    refreshStore.removeListener('change', callback);
  }

  function setOptions(newOpts) {
    Object.assign(options, newOpts);
    refreshStore.emit('change', options);
  }

  function getOptions() {
    return options;
  }

  return {
    subscribeListener,
    unsubscribeListener,
    setOptions,
    getOptions,
  };
}
export default new RefreshStore;
