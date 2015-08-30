import codeExamples from '../examples/examples.js';
import earlyDeliverable from '../../docs/earlyDeliverable.js';


function ConstantStore() {
  const constants = {
    codeExamples,
    markdown: {
      earlyDeliverable,
    },
  };

  function getConstants() {
    return constants;
  }

  return {
    getConstants,
  };
}
export default new ConstantStore;
