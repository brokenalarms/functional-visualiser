/* specifically for those options that can be applied on-the-fly as the dynamic
   visualiser runs; the options are read directly on each pass of update() and so don't 
   cause React to rerender the components involved.
*/

const event = require('events');

function LiveOptionStore() {
  const liveOptionStore = Object.create(event.EventEmitter.prototype);
  let liveOptions = {
    sequencer: {
      delay: 1000,
    },
  };

  function subscribeListener(callback) {
    liveOptionStore.on('change', callback);
  }

  function unsubscribeListener(callback) {
    liveOptionStore.removeListener('change', callback);
  }

  function setOptions(newOpts) {
    Object.assign(liveOptions, newOpts);
    liveOptionStore.emit('change');
  }

  function getOptions() {
    return liveOptions;
  }

  return {
    subscribeListener,
    unsubscribeListener,
    setOptions,
    getOptions,
  };
}
export default new LiveOptionStore;
