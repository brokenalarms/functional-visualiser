import React from 'react';
import initialize from '../../../../modules/d3Visualiser/d3Visualiser.js';

// Interface between React and D3.
// Initialize and code is pushed from above via ActionPane,
// updates are pushed directly from updateStore without React knowing.

class D3Root extends React.Component {

  static propTypes = {
    nodes: React.PropTypes.array,
    links: React.PropTypes.array,
    dimensions: React.PropTypes.array,
  }

  componentDidMount = () => {
    /* this module is stateless; the parent decides
       whether to update with new props,
       at which point D3 is refreshed. */
    this.handoverToD3();
  }

  componentDidUpdate = () => {
    this.handoverToD3();
  }

  render() {
    return (
      <div className="flex-vis-pane"></div>
    );
  }

  handoverToD3 = () => {
    if (this.props.nodes) {
      const element = React.findDOMNode(this);
      initialize(element,
        this.props.nodes,
        this.props.links,
        this.props.dimensions);
    }
  }
}
export default D3Root;
