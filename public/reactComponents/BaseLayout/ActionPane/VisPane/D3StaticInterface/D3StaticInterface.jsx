import React from 'react';
import CodeStore from '../../../../../modules/stores/CodeStore.js';
import OptionStore from '../../../../../modules/stores/OptionStore.js';
import astTools from '../../../../../modules/astTools/astTools.js';
import buildGraph from '../../../../../modules/d3StaticVisualizer/BuildStaticCallGraph.js';
import initialize from '../../../../../modules/d3StaticVisualizer/d3StaticCallGraph.js';

class D3StaticInterface {

  static propTypes = {
    dimensions: React.PropTypes.object,
  }

  componentDidMount = () => {
    this.d3Restart();
  }

  componentDidUpdate = () => {
    this.d3Restart();
  }

  componentWillUnmount() {

  }


  d3Restart = () => {
    let codeString = (CodeStore.get()) ?
      CodeStore.get().toString().trim() :
      OptionStore.getOptions().staticCodeExample.toString().trim();
    let runCodeString = astTools.getRunCodeString(codeString);
    let [nodes, links] = buildGraph.get(runCodeString);
    let element = React.findDOMNode(this);
    initialize(element, nodes, links,
      this.props.dimensions);
  }

  render() {
    return (
      <div className="d3-root"></div>
    );
  }
}
export default D3StaticInterface;
