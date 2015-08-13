import React from 'react';
import {Dialog, FlatButton} from 'material-ui';
import Markdown from 'react-remarkable';

class MarkdownModal {

  static propTypes = {
    markdown: React.PropTypes.object,
  }

  componentDidMount() {
    this.refs.dialog.show();
  }


  componentDidUpdate() {
    //    this.refs.dialog.show();
  }

  render() {
    let customActions = [<FlatButton
    label="Close"
    primary={true}
    onTouchTap={this.handleDialogClose} />];

    return (
      <Dialog  ref="dialog"
            title={this.props.markdown.title}
            actions={customActions}
        autoDetectWindowHeight={true}
        autoScrollBodyContent={true}>
        <div style={{height: '500px', 'overflowY': 'auto'}}>
         <Markdown source={this.props.markdown.body}/>
        </div>
        </Dialog>
    );
  }

  handleDialogClose = () => {
    this.refs.dialog.dismiss();
  };

}

export default MarkdownModal;
