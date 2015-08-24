import React from 'react';
import DynamicControlBar from './DynamicControlBar/DynamicControlBar.jsx';

class ControlBar {

  static propTypes = {
    visualizationType: React.PropTypes.string,
  }

  render() {
    let controlBar = (this.props.visualizationType === 'dynamic') ?
      <DynamicControlBar /> : null;

    return (
      <div>
      {controlBar}
      </div>
    );
  }
}

export default ControlBar;
