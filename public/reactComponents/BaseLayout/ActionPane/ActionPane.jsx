import React from 'react';
import CodePane from './CodePane/CodePane.jsx';
import VisPane from './VisPane/Vispane.jsx';

import RefreshStore from '../../../modules/stores/RefreshStore.js';
import CodeStore from '../../../modules/stores/CodeStore.js';


class ActionPane extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showDynamic: RefreshStore.getOptions().showDynamic,
      visualizationDimensions: RefreshStore.getOptions().dimensions,
      codeString: CodeStore.get(),
    };
  }

  componentDidMount() {
    RefreshStore.subscribeListener(this.onRefreshOptionsChanged);
    CodeStore.subscribeListener(this.onNewCodeString);
  }

  componentWillUnmount = () => {
    RefreshStore.unsubscribeListener(this.onRefreshOptionsChanged);
    CodeStore.unsubscribeListener(this.onNewCodeString);
  }


  // those changes requiring a component refresh.
  // Below here, the components subscribe to code changes directly.
  onRefreshOptionsChanged = () => {
    this.setState({
      showDynamic: RefreshStore.getOptions().showDynamic,
      visualizationDimensions: RefreshStore.getOptions().dimensions,
    });
  }

  onNewCodeString = () => {
    this.setState({
      codeString: CodeStore.get(),
    });
  }

  render = () => {
    return (
      <div className="flex-action-pane">
        <VisPane
          codeString={this.state.codeString}
          showDynamic={this.state.showDynamic}
          dimensions={this.state.visualizationDimensions}/>
        <CodePane
          codeString={this.state.codeString}
          showDynamic={this.state.showDynamic} />
      </div>
    );
  }
}

export default ActionPane;
