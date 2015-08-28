/* specifically to announce when the code is running or not, 
   to give immediate timeout independent feedback to Editor
   and ControlBar, and checked on each pass of the Sequencer. */

const event = require('events');

function LiveOptionStore() {
  const liveOptionStore = Object.create(event.EventEmitter.prototype);

  let codeRunning = false;

  function subscribeListener(callback) {
    liveOptionStore.on('change', callback);
  }

  function unsubscribeListener(callback) {
    liveOptionStore.removeListener('change', callback);
  }

  function setCodeRunning(flag) {
    codeRunning = flag;
    liveOptionStore.emit('change');
  }

  function isCodeRunning() {
    return codeRunning;
  }

  return {
    subscribeListener,
    unsubscribeListener,
    setCodeRunning,
    isCodeRunning,
  };
}
export default new LiveOptionStore;
