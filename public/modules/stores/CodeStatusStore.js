/* specifically to announce when the code is running or not, 
   to give immediate timeout independent feedback to Editor
   and ControlBar, and checked on each pass of the Sequencer. */

const event = require('events');

function CodeStatusStore() {
  const codeStatusStore = Object.create(event.EventEmitter.prototype);

  let codeRunning = false;
  let codeParsed = false;

  function subscribeListener(callback) {
    codeStatusStore.on('change', callback);
  }

  function unsubscribeListener(callback) {
    codeStatusStore.removeListener('change', callback);
  }

  function setCodeRunning(flag) {
    codeRunning = flag;
    codeStatusStore.emit('change', {
      codeRunning, codeParsed,
    });
  }

  function isCodeRunning() {
    return codeRunning;
  }

  function setCodeParsed(flag) {
    codeParsed = flag;
    codeRunning = false;
    codeStatusStore.emit('change', {
      codeRunning, codeParsed,
    });
  }

  function isCodeParsed() {
    return codeParsed;
  }

  return {
    subscribeListener,
    unsubscribeListener,
    setCodeRunning,
    isCodeRunning,
    setCodeParsed,
    isCodeParsed,
  };
}
export default new CodeStatusStore;
