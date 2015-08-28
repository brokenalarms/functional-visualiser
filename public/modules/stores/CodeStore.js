/* Solely for live updating code, since a number of components
   subscribe specifically to this and nothing else.*/

const event = require('events');

function CodeStore() {
  const codeStore = Object.create(event.EventEmitter.prototype);

  let staticCodeUser = null;

  function subscribeListener(callback) {
    codeStore.on('change', callback);
  }

  function unsubscribeListener(callback) {
    codeStore.removeListener('change', callback);
  }

  function set(newCode, surpressUpdate) {
    staticCodeUser = newCode;
    if(!surpressUpdate){
    codeStore.emit('change');
    }
  }

  function get() {
    return staticCodeUser;
  }

  return {
    subscribeListener,
    unsubscribeListener,
    set,
    get,
  };
}
export default new CodeStore;
