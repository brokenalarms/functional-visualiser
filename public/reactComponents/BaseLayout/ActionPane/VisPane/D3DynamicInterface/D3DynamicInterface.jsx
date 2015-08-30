import React from 'react';
import d3Dynamic from '../../../../../modules/d3DynamicVisualiser/d3DynamicVisualiser.js';
import SequencerStore from '../../../../../modules/stores/SequencerStore.js';

// Interface between React and D3.
// Initialize and code is pushed from above via ActionPane, but
// updates are pushed directly from SequencerStore without React knowing.
// (manipulating state directly in d3DynamicVisualizer via d3Update function)

class D3DynamicInterface {

  static propTypes = {
    dimensions: React.PropTypes.object,
  }

  componentDidMount = () => {
    SequencerStore.subscribeListener(this.onSequencerUpdate);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    SequencerStore.unsubscribeListener(this.onSequencerUpdate);
   // d3Dynamic.destroy(React.findDOMNode(this));
  }

  onSequencerUpdate = (shouldResetD3) => {
    // noop if component has already unmounted.
    if (shouldResetD3) {
      // SequencerStore has new array ref,
      // re-link to Store and re-initialize force layout
      this.d3Restart();
    } else {
      d3Dynamic.update();
    }
  }

  d3Restart = () => {
    let element = React.findDOMNode(this);
    d3Dynamic.initialize(element,
      SequencerStore.linkState().nodes,
      SequencerStore.linkState().links,
      this.props.dimensions);
  }

  render() {
    return (
      <div className="d3-dynamic-root"></div>
    );
  }
}
export default D3DynamicInterface;
