import React from 'react';
import CodePane from './CodePane/CodePane.jsx';
import VisPane from './VisPane/Vispane.jsx';

import OptionStore from '../../../modules/stores/OptionStore.js';
import StaticCallGraph from '../../../modules/astTransforms/StaticCallGraph.js';


class ActionPane extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      staticCode: OptionStore.getOptions().staticCode,
      visualizationType: OptionStore.getOptions().visualizationType,
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
      staticCode: OptionStore.getOptions().staticCode,
      visualizationType: OptionStore.getOptions().visualizationType,
    });
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    let clickedItem = OptionStore.getOptions().clickedItem;
    return (!nextProps.isNavBarShowing && nextState.staticCode &&
      clickedItem && clickedItem.optionGroup === 'codeExamples');
  }

  render = () => {
    let codeString = this.state.staticCode.toString();
    if (this.state.staticCode) {
      const [nodes, links] =
      StaticCallGraph.get(codeString);
      return (
        <div className="flex-action-pane">
        <VisPane
          nodes={nodes}
          links={links}
          dimensions={{width: 1000, height: 800}}/>
        <CodePane
          codeString={codeString}
          visualizationType={this.state.visualizationType} />
      </div>
      );
    }
    return null;
  }
}

export default ActionPane;
