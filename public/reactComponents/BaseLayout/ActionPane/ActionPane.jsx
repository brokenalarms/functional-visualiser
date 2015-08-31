import React from 'react';
import CodePane from './CodePane/CodePane.jsx';
import VisPane from './VisPane/Vispane.jsx';

import RefreshStore from '../../../modules/stores/RefreshStore.js';


class ActionPane extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showDynamic: RefreshStore.getOptions().showDynamic,
      visualizationDimensions: RefreshStore.getOptions().dimensions,
    };
  }

  componentDidMount() {
    RefreshStore.subscribeListener(this.onRefreshOptionsChanged);
  }

  componentWillUnmount = () => {
    RefreshStore.unsubscribeListener(this.onRefreshOptionsChanged);
  }


  // those changes requiring a component refresh.
  // Below here, the components subscribe to code changes directly.
  onRefreshOptionsChanged = () => {
    this.setState({
      showDynamic: RefreshStore.getOptions().showDynamic,
      visualizationDimensions: RefreshStore.getOptions().dimensions,
    });
  }

  render = () => {
    return (
      <div className="flex-action-pane">
        <VisPane
          showDynamic={this.state.showDynamic}
          dimensions={this.state.visualizationDimensions}/>
        <CodePane
          showDynamic={this.state.showDynamic} />
      </div>
    );
  }
}

export default ActionPane;
