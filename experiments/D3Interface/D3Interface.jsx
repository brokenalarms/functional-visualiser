import React from 'react';

import visInterface from '../../../../../modules/VisualizationInterface/VisualizationInterface.js';
import SequencerStore from '../../../../../modules/stores/SequencerStore.js';


// Interface between React and D3.
// Choice between d3Static and d3Dynamic, and the varying init options each require,
// are massaged and provided via the seperate VisualizationInterface,
// so that additional D3 graphs could then be added there if required.
// Both d3Dynamic and d3Static then expose same {initialize, update, destroy} API.
// Updates to d3Dynamic are pushed directly from SequencerStore without React knowing.
class D3Interface {

  static propTypes = {
    dimensions: React.PropTypes.object,
    showDynamic: React.PropTypes.bool,
    codeString: React.PropTypes.string,
  }

  componentDidMount = () => {
    SequencerStore.subscribeListener(this.onSequencerStoreUpdate);
    this.handoverToD3();
  }

  shouldComponentUpdate = (nextProps) => {
    return false;
  }

  componentDidUpdate = () => {
    this.handoverToD3();
  }

  componentWillUnmount = () => {
    SequencerStore.unsubscribeListener(this.onSequencerStoreUpdate);
    let element = React.findDOMNode(this);
    this.state.d3Interface.destroy(element);
  }

  // this only happens for d3Dynamic.
  onSequencerStoreUpdate = (shouldResetD3) => {
    if (shouldResetD3) {
      this.handoverToD3();
    } else {
      visInterface.getInterface().update();
    }
  }

  handoverToD3 = () => {
    if (this.props.codeString) {
      let [nodes, links] =
      visInterface.getNodesAndLinks(this.props.codeString);
      let element = React.findDOMNode(this);
      visInterface.getInterface().initialize(element,
        nodes,
        links,
        this.props.dimensions, this.handoverToD3);
      visInterface.getInterface().update();
    }
  }

  render() {
    return (
      <div className="d3-root"></div>
    );
  }
}
export default D3Interface;
