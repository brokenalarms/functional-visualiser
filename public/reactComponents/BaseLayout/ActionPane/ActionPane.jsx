import React from 'react';
import CodePane from './CodePane/CodePane.jsx';
import VisPane from './VisPane/Vispane.jsx';
import OptionStore from '../../../modules/stores/OptionStore.js';

class ActionPane extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      staticCodeExample: OptionStore.getOptions().staticCodeExample,
      showDynamic: OptionStore.getOptions().showDynamic,
      visualizationDimensions: OptionStore.getOptions().dimensions,
    };
  }

  componentDidMount() {
    OptionStore.subscribeListener(this.onOptionsChanged);
  }

  componentWillUnmount = () => {
    OptionStore.unsubscribeListener(this.onOptionsChanged);
  }

  onOptionsChanged = () => {
    this.setState({
      staticCodeExample: OptionStore.getOptions().staticCodeExample,
      showDynamic: OptionStore.getOptions().showDynamic,
      visualizationDimensions: OptionStore.getOptions().dimensions,
    });
  }

  render = () => {
    return (
      <div className="flex-action-pane">
        <VisPane
          showDynamic={this.state.showDynamic}
          dimensions={this.state.visualizationDimensions}/>
        <CodePane
          staticCodeExample={this.state.staticCodeExample}
          showDynamic={this.state.showDynamic} />
      </div>
    );
  }
}

export default ActionPane;
