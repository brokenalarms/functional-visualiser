import React from 'react';
import {Dialog, FlatButton} from 'material-ui';
import Markdown from 'react-remarkable';
import NavigationStore from '../../../../modules/stores/NavigationStore.js';


class MarkdownModal {

  static propTypes = {
    selectedMarkdown: React.PropTypes.object,
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.selectedMarkdown;
  }

  componentDidUpdate = () => {
    this.refs.dialog.show();
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

    if (!this.props.selectedMarkdown) {
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
          title={this.props.selectedMarkdown.title}
          actions={customActions}
          openImmediately={true}
          onDismiss={this.handleDialogClose.bind(this, false)}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}>
        <div style={{height: '500px', 'overflowY': 'auto'}}>
          <Markdown
            key="markdownModal"
            source={this.props.selectedMarkdown.body}/>
        </div>
     </Dialog>
    );
  }

}

export default MarkdownModal;
