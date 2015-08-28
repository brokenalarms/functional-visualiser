import React from 'react';
import D3DynamicInterface from './D3DynamicInterface/D3DynamicInterface.jsx';
import D3StaticInterface from './D3StaticInterface/D3StaticInterface.jsx';

/* Connects the static or dynamic d3 interface depending on option. */

class VisPane extends React.Component {

  static propTypes = {
    dimensions: React.PropTypes.object,
    showDynamic: React.PropTypes.bool,
  }

  render = () => {
    let d3Component = (this.props.showDynamic) ?
      <D3DynamicInterface dimensions={this.props.dimensions} /> :
      <D3StaticInterface dimensions={this.props.dimensions} />;
      return (
        <div className="flex-vis-pane">
        {d3Component}
        </div>
      );
  }
}
export default VisPane;
