/* specifically for those options that can be applied on-the-fly as the dynamic
   visualiser runs; the options are read directly on each pass of update() and so don't 
   cause React to rerender the components involved.
*/

const event = require('events');

function LiveOptionStore() {
  const liveOptionStore = Object.create(event.EventEmitter.prototype);
  let liveOptions = {
    isCodeRunning: false,
    sequencer: {
      delay: 500,
    },
  };

  function subscribeListener(callback) {
    liveOptionStore.on('change', callback);
  }

  function unsubscribeListener(callback) {
    liveOptionStore.removeListener('change', callback);
  }

  function set(newOpts) {
    Object.assign(liveOptions, newOpts);
    liveOptionStore.emit('change');
  }

  function get() {
    return liveOptions;
  }

  function isCodeRunning() {
    return liveOptions.isCodeRunning;
  }

  return {
    subscribeListener,
    unsubscribeListener,
    set,
    get,
    isCodeRunning,
  };
}
export default new LiveOptionStore;
