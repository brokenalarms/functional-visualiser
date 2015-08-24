/* Solely for live updating code, since a number of components
   subscribe specifically to this and nothing else.*/

const event = require('events');

function CodeStore() {
  const codeStore = Object.create(event.EventEmitter.prototype);

  let staticCode = null;

  function subscribeListener(callback) {
    codeStore.on('change', callback);
  }

  function unsubscribeListener(callback) {
    codeStore.removeListener('change', callback);
  }

  function set(newCode) {
    staticCode = newCode;
    codeStore.emit('change');
  }

  function onCodeEdited() {
  }

  function get() {
    return staticCode;
  }

  return {
    subscribeListener,
    unsubscribeListener,
    set,
    get,
    onCodeEdited,
  };
}
export default new CodeStore;
