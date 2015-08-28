import React from 'react';
import {initialize as d3Initialize, update as d3Update} from '../../../../../modules/d3DynamicVisualiser/d3DynamicVisualiser.js';
import SequencerStore from '../../../../../modules/stores/SequencerStore.js';

// Interface between React and D3.
// Initialize and code is pushed from above via ActionPane, but
// updates are pushed directly from SequencerStore without React knowing.
// (manipulating state directly in d3DynamicVisualizer via d3Update function)

class D3DynamicInterface extends React.Component {

  static propTypes = {
    dimensions: React.PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      nodes: SequencerStore.linkState().nodes,
      links: SequencerStore.linkState().links,
    };
  }


  componentDidMount = () => {
    /* this module is stateless; the parent decides
       whether to update with new props,
       at which point D3 is refreshed. */
    /* subscribe listener to start redrawing
     when the dynamic simulation is started.*/
    this.d3Restart();
    SequencerStore.subscribeListener(this.handleSequencerUpdate);
  }

  componentDidUpdate = () => {
    this.d3Restart();
  }

  componentWillUnmount() {
    SequencerStore.unsubscribeListener(this.handleSequencerUpdate);
  }

  handleSequencerUpdate = (shouldResetD3) => {
    if (shouldResetD3) {
      // SequencerStore has new array ref,
      // re-link to Store and re-initialize force layout
      this.setState({
        nodes: SequencerStore.linkState().nodes,
        links: SequencerStore.linkState().links,
      });
    } else {
      d3Update();
    }
  }

  d3Restart = () => {
    let element = React.findDOMNode(this);
    d3Initialize(element,
      this.state.nodes,
      this.state.links,
      this.props.dimensions);
  }

  render() {
    return (
      <div></div>
    );
  }
}
export default D3DynamicInterface;
