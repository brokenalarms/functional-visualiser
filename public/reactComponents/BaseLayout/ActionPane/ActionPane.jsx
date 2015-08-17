// TODO - responsible for layout of windows (multiple vis panes?)

import React from 'react';

import optionStore from '../../../modules/stores/optionStore.js';
import getVisPaneNodes from '../../../modules/astParser/astParser.js';

import CodePane from './CodePane/CodePane.jsx';
import VisPane from './VisPane/Vispane.jsx';

class ActionPane extends React.Component {

  constructor() {
    super();
    this.state = {
      // TODO - TESTING - to be changed to null
      selectedCode: optionStore.getOptions().codeExamples.sum.imperative,
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
    if (this.state.selectedCode) {
      let exampleString = this.state.selectedCode.toString();
      const [nodes, links] = getVisPaneNodes(exampleString);
      return (
        <div className="flex-action-pane">
        <VisPane
          nodes={nodes}
          links={links}
          dimensions={[1000, 800]}/>
        <CodePane
          codeString={exampleString} />
      </div>
      );
    }
    return null;
  }
}

export default ActionPane;
