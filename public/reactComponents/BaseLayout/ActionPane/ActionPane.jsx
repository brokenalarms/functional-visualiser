import React from 'react';
import CodePane from './CodePane/CodePane.jsx';
import VisPane from './VisPane/Vispane.jsx';

import optionStore from '../../../modules/stores/optionStore.js';
import StaticCallGraph from '../../../modules/astTransforms/StaticCallGraph.js';


class ActionPane extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // TODO - TESTING - to be changed to null
      selectedCode: optionStore.getOptions().codeExamples.assorted.nestedReturn,
    };
  }

  static propTypes = {
    currentLine: React.PropTypes.number,
  }

  componentDidMount() {
    optionStore.subscribeListener(this.onOptionsChanged);
  }

  componentWillUnmount = () => {
    optionStore.unsubscribeListener(this.onOptionsChanged);
  }

  onOptionsChanged = () => {
    this.setState({
      selectedCode: optionStore.getOptions().selectedCode,
    });
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    let clickedItem = optionStore.getOptions().clickedItem;
    return (!nextProps.isNavBarShowing && nextState.selectedCode &&
      clickedItem && clickedItem.optionGroup === 'codeExamples');
  }

  render = () => {
    let codeString = this.state.selectedCode.toString();
    if (this.state.selectedCode) {
      const [nodes, links] =
      StaticCallGraph.get(codeString);
      return (
        <div className="flex-action-pane">
        <VisPane
          nodes={nodes}
          links={links}
          dimensions={[1000, 800]}/>
        <CodePane
          codeString={codeString} />
      </div>
      );
    }
    return null;
  }
}

export default ActionPane;
