import React from 'react';
import D3DynamicInterface from './D3DynamicInterface/D3DynamicInterface.jsx';
import D3StaticInterface from './D3StaticInterface/D3StaticInterface.jsx';

class VisPane extends React.Component {

  static propTypes = {
    dimensions: React.PropTypes.object,
    showDynamic: React.PropTypes.bool,
    codeString: React.PropTypes.string,
  }

  render = () => {
    let d3Component = null;
    if (this.props.codeString) {
      if (this.props.showDynamic) {
        d3Component = (
          <D3DynamicInterface 
            dimensions={this.props.dimensions} />);
      } else {
        d3Component = (
          <D3StaticInterface 
            codeString={this.props.codeString}
            dimensions={this.props.dimensions}/>);
      }
    }

    return (
      <div className="flex-vis-pane"
      style={{width: this.props.dimensions.width + 'px', height: this.props.dimensions.height + 'px'}}>
      {d3Component}
      </div>
    );
  }
}
export default VisPane;
