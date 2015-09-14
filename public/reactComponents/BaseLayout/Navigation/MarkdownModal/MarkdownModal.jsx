import React from 'react';
import {Dialog, FlatButton} from 'material-ui';
import Markdown from 'react-remarkable';
import NavigationStore from '../../../../modules/stores/NavigationStore.js';


class MarkdownModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedMarkdown: null,
    };
  }

  componentDidMount = () => {
    NavigationStore.subscribeListener(this.onNavigationStoreChange);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.selectedMarkdown;
  }

  componentDidUpdate = () => {
    this.refs.dialog.show();
  }

  componentWillUnmount = () => {
    NavigationStore.unsubscribeListener(this.onNavigationStoreChange);
  }

  onNavigationStoreChange = () => {
    this.setState({
      selectedMarkdown: NavigationStore.getSelectedMarkdown(),
    });
  }

  handleDialogClose = (userClickedCloseButton) => {
    if (userClickedCloseButton) {
      this.refs.dialog.dismiss();
    }
    NavigationStore.setOptions({
      selectedMarkdown: null,
    });
  };

  render() {

    if (!this.state.selectedMarkdown) {
      return null;
    }

    let customActions = [<FlatButton
                            key="close"
                            label="Close"
                            primary={true}
                            onTouchTap={this.handleDialogClose.bind(this, true)}
                        />];
    return (
      <Dialog 
          ref="dialog"
          key="dialog"
          style={{color: 'white'}}
          title={this.state.selectedMarkdown.title}
          actions={customActions}
          openImmediately={true}
          onDismiss={this.handleDialogClose.bind(this, false)}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}>
        <div style={{height: '500px', 'overflowY': 'auto'}}>
          <Markdown
            key="markdownModal"
            source={this.state.selectedMarkdown.body}/>
        </div>
     </Dialog>
    );
  }

}

export default MarkdownModal;
