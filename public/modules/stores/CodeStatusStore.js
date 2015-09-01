/* specifically to announce when the code is running or not, 
   to give immediate timeout independent feedback to Editor
   and ControlBar, and checked on each pass of the Sequencer. */

const event = require('events');

function CodeStatusStore() {
  const codeStatusStore = Object.create(event.EventEmitter.prototype);

  let codeRunning = false;
  let codeParsed = false;
  let codeFinished = false;

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

  function emitChange() {
    codeStatusStore.emit('change', {
      codeRunning, codeParsed, codeFinished,
    });
  }

  function setCodeParsed(flag) {
    codeParsed = flag;
    codeRunning = false;
    codeFinished = false;
    emitChange();
  }

  function isCodeParsed() {
    return codeParsed;
  }

  function setCodeFinished(flag) {
    codeFinished = flag;
    codeRunning = false;
    emitChange();
  }

  function isCodeFinished() {
    return codeFinished;
  }

  return {
    subscribeListener,
    unsubscribeListener,
    setCodeRunning,
    isCodeRunning,
    setCodeParsed,
    isCodeParsed,
    setCodeFinished,
    isCodeFinished,
  };
}
export default new CodeStatusStore;
