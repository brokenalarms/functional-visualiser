import React from 'react';
import CodePane from './CodePane/CodePane.jsx';
import VisPane from './VisPane/Vispane.jsx';
import OptionStore from '../../../modules/stores/OptionStore.js';

class ActionPane extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      staticCodeExample: OptionStore.getOptions().staticCodeExample,
      visualizationType: OptionStore.getOptions().visualization.type,
      visualizationDimensions: OptionStore.getOptions().visualization.dimensions,
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
      visualizationType: OptionStore.getOptions().visualization.type,
      visualizationDimensions: OptionStore.getOptions().visualization.dimensions,
    });
  }

/*  shouldComponentUpdate = (nextProps, nextState) => {
    let clickedItem = OptionStore.getOptions().clickedItem;
    return (!nextProps.isNavBarShowing && nextState.staticCodeExample &&
      clickedItem && clickedItem.optionGroup === 'codeExamples');
  }*/

  render = () => {
    return (
      <div className="flex-action-pane">
        <VisPane
          type={this.state.visualizationType}
          dimensions={this.state.visualizationDimensions}/>
        <CodePane
          staticCodeExample={this.state.staticCodeExample}
          type={this.state.visualizationType} />
      </div>
    );
  }
}

export default ActionPane;
