/* specifically for those options that can be applied on-the-fly as the dynamic
   visualiser runs; the options are read directly on each pass of update() and so don't 
   cause React to rerender the components involved.
*/

const event = require('events');

function LiveOptionStore() {
  const liveOptionStore = Object.create(event.EventEmitter.prototype);

  let liveOptions = {
    codeRunning: false,
    interpreterStarted: false,
    options: {
      sequencer: {
        delay: 50,
      },
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

  function setCodeRunning(flag) {
    setOptions({
      codeRunning: flag,
    });
  }

  function getOptions() {
    return liveOptions.options;
  }

  function isCodeRunning() {
    return liveOptions.codeRunning;
  }

  return {
    subscribeListener,
    unsubscribeListener,
    getOptions,
    setCodeRunning,
    isCodeRunning,
  };
}
export default new LiveOptionStore;
