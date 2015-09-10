/* Solely for live updating code, since a number of components
   subscribe specifically to this and nothing else.*/

const event = require('events');

function CodeStore() {
  const codeStore = Object.create(event.EventEmitter.prototype);

  let codeString = '';

  function subscribeListener(callback) {
    codeStore.on('change', callback);
  }

  function unsubscribeListener(callback) {
    codeStore.removeListener('change', callback);
  }

  function set(newCode, userUpdate, fromExample) {
    codeString = newCode.toString().trim();
    if (fromExample) {
      codeString = codeString.replace(/\n(    )/, '');
  }
  codeStore.emit('change', userUpdate);
}

function get() {
  return codeString;
}

return {
  subscribeListener,
  unsubscribeListener,
  set,
  get,
};
}
export default new CodeStore;
