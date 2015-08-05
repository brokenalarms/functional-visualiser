import event from 'events';
import examples from '../examples/examples.js';

/* simple event store / emitter singleton.
   I have done this without using the flux helper library
   as assistance, in order to understand the architecture
   of a callback registry / events emitter. */

function OptionStore() {
  const options = {};
  const optionStore = Object.create(event.EventEmitter.prototype);

  // read in available examples from constants file
  options.examples = examples;

  function subscribeListener(callback) {
    optionStore.on('change', callback);
  }

  function unsubscribeListener(callback) {
    optionStore.removeListener('change', callback);
  }

  function setOptions(newOpts) {
    Object.assign(options, newOpts);
    optionStore.emit('change');
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
export default new OptionStore;
