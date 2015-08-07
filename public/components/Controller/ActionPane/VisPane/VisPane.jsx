import React from 'react';
import initialize from './D3Helper.js';

class D3Root extends React.Component {

  static propTypes = {
    funcMap: React.PropTypes.array,
    dimensions: React.PropTypes.array,
  }

  constructor() {
    super();
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
    // const ast = astParser(this.props.codeLocation);
    return (
      <div className="d3-root"></div>
    );
  }

  handoverToD3 = () => {
    if (this.props.funcMap) {
      const element = React.findDOMNode(this);
      initialize(element, this.props.dimensions, this.props.funcMap);
    }
  }
}
export default D3Root;
