import React from 'react';
import CodeStore from '../../../../../modules/stores/CodeStore.js';
import OptionStore from '../../../../../modules/stores/OptionStore.js';
import astTools from '../../../../../modules/astTools/astTools.js';
import buildGraph from '../../../../../modules/d3StaticVisualizer/BuildStaticCallGraph.js';
import d3Static from '../../../../../modules/d3StaticVisualizer/d3StaticVisualizer.js';

class D3StaticInterface {

  static propTypes = {
    dimensions: React.PropTypes.object,
    showDynamic: React.PropTypes.bool,
  }

  componentDidMount = () => {
    // React still appears to render component
    // by virtue of writing it outside of render
    // in ActionPane even if conditional 'showDynamic' fails
    if (!this.props.showDynamic) {
      this.d3Restart();
    }
  }

  componentDidUpdate = () => {
    if (!this.props.showDynamic) {
      this.d3Restart();
    }
  }

  componentWillUnmount() {
    d3Static.destroy();
  }


  d3Restart = () => {
    let codeString = (CodeStore.get()) ?
      CodeStore.get().toString().trim() :
      OptionStore.getOptions().staticCodeExample.toString().trim();
    let runCodeString = astTools.getRunCodeString(codeString);
    let [nodes, links] = buildGraph.get(runCodeString);
    let element = React.findDOMNode(this);
    d3Static.initialize(element, nodes, links,
      this.props.dimensions);
  }

  render() {
    return (
      <div className="d3-root"></div>
    );
  }
}
export default D3StaticInterface;
