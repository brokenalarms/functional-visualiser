/* Stores those selections referring to constants,
   or those options that require a React component refresh
   to put into effect.*/

const event = require('events');
import codeExamples from '../examples/examples.js';
import earlyDeliverable from '../../docs/earlyDeliverable.js';


function OptionStore() {
  const optionStore = Object.create(event.EventEmitter.prototype);
  const options = {};

  Object.assign(options, {
      showDynamic: false,
      dimensions: {
        width: 1200,
        height: 800,
      },
    clickedItem: null,
    codeExamples,
    markdown: {
      earlyDeliverable,
    },
    selectedMarkdown: null,
    staticCodeExample: null,
  });
// TODO - just for testing, set to null initially
options.staticCodeExample = options.codeExamples.assorted.fibonacciRecursive;

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
