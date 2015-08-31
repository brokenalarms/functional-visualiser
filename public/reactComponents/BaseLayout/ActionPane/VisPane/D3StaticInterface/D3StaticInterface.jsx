import React from 'react';
import astTools from '../../../../../modules/astTools/astTools.js';
import buildGraph from '../../../../../modules/d3StaticVisualizer/BuildStaticCallGraph.js';
import d3Static from '../../../../../modules/d3StaticVisualizer/d3StaticVisualizer.js';
import CodeStatusStore from '../../../../../modules/stores/CodeStatusStore.js';
import CodeStore from '../../../../../modules/stores/CodeStore.js';


class D3StaticInterface {

  static propTypes = {
    dimensions: React.PropTypes.object.isRequired,
  }

  componentDidMount = () => {
    CodeStatusStore.subscribeListener(this.onCodeStatusStoreUpdate);
    CodeStore.subscribeListener(this.onNewCodeString);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount = () => {
    CodeStatusStore.unsubscribeListener(this.onCodeStatusStoreUpdate);
    CodeStore.unsubscribeListener(this.onNewCodeString);
  }

  onCodeStatusStoreUpdate = (codeOptions) => {
    // the ControlBar just sets 'codeParsed' to true here
    // which is sufficient for redrawing the static analyzer.
    if (codeOptions.codeParsed) {
      this.d3Restart();
    } else {
      d3Static.destroy(React.findDOMNode(this));
    }
  }

  onNewCodeString = () => {
    d3Static.destroy(React.findDOMNode(this));
  }

  d3Restart = () => {
    let runCodeString = astTools.getRunCodeString(CodeStore.get());
    let [nodes, links] = buildGraph.get(runCodeString);
    let element = React.findDOMNode(this);
    d3Static.initialize(element, nodes, links,
      this.props.dimensions);
    d3Static.update();
  }

  render() {
    return (
      <div className="d3-static-root"></div>
    );
  }
}
export default D3StaticInterface;
