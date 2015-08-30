/* Massages and dispatches generic commands
   to the appropriate format for the static and dynamic
   d3 visualizations. */

import astTools from '../astTools/astTools.js';
import buildGraph from '../d3StaticVisualizer/BuildStaticCallGraph.js';
import d3Dynamic from '../d3DynamicVisualiser/d3DynamicVisualiser.js';
import d3Static from '../d3StaticVisualizer/d3StaticVisualizer.js';
import SequencerStore from '../stores/SequencerStore.js';

function VisualizationInterface() {

  let intrface = null; // interface is reserved word :P

  // hypothetically this could be modified from boolean
  // to support a variety of plugin graphs
  function getInterface(showDynamic) {
    intrface = (showDynamic) ? d3Dynamic : d3Static;
    return intrface;
  }

  function getNodesAndLinks(showDynamic, codeString) {
    let nodes, links;
    if (showDynamic) {
      // SequencerStore has new array ref for dynamicVisualizer
      // re-link to Store and re-initialize force layout
      nodes = SequencerStore.linkState().nodes;
      links = SequencerStore.linkState().links;
    } else {
      [nodes, links] = prepareStaticGraph(codeString);
    }
    return [nodes, links];
  }

  function prepareStaticGraph(codeString) {
    let runCodeString = astTools.getRunCodeString(codeString);
    let [nodes, links] = buildGraph.get(runCodeString);
    return [nodes, links];
  }

  return {
    getNodesAndLinks,
    getInterface,
  };

}

export default new VisualizationInterface;
