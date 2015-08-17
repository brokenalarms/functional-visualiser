import React from 'react';
import {Dialog, FlatButton} from 'material-ui';
import Markdown from 'react-remarkable';

import optionStore from '../../../modules/stores/optionStore.js';

class MarkdownModal extends React.Component {

  constructor() {
    super();
    this.state = {
      markdown: null,
    };
  }

  componentDidMount() {
    optionStore.subscribeListener(this.onOptionsChanged);
  }


  componentDidUpdate = () => {
    if (this.state.markdown) {
      this.refs.dialog.show();
    }
  }


  componentWillUnmount = () => {
    optionStore.unsubscribeListener(this.onOptionsChanged);
  }


  onOptionsChanged = () => {
    this.setState({
      markdown: optionStore.getOptions().selectedMarkdown,
    });
  }

  render() {
    if (!this.state || !this.state.markdown) {
      return null;
    }
    let customActions = [<FlatButton
                            label="Close"
                            primary={true}
                            onTouchTap={this.handleDialogClose.bind(this, true)}
                        />];
    return (
      <Dialog 
            ref="dialog"
            title={this.state.markdown.title}
            actions={customActions}
            onDismiss={this.handleDialogClose.bind(this, false)}
        autoDetectWindowHeight={true}
        autoScrollBodyContent={true}>
        <div style={{height: '500px', 'overflowY': 'auto'}}>
         <Markdown
         key="markdown"
         source={this.state.markdown.body}/>
        </div>
        </Dialog>
    );
  }

  /*  componentShouldUpdate = (nextProps, nextState) => {
      return (nextState.markdown !== null &&
        this.state.markdown !== nextState.markdown);
    }
  */
  handleDialogClose = (clickedClose) => {
    optionStore.setOptions({
      selectedMarkdown: null,
    });
    if (clickedClose) {
      this.refs.dialog.dismiss();
    }
  };

}

export default MarkdownModal;
