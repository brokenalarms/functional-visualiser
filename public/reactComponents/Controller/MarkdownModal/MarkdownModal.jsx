import React from 'react';
import {Dialog, FlatButton} from 'material-ui';
import Markdown from 'react-remarkable';

class MarkdownModal {

  static defaultProps = {
    title: 'test',
    markdown: null,
  }

  componentDidMount() {
    this.refs.dialog.show();
}


  componentDidUpdate() {
//    this.refs.dialog.show();
  }

  render() {
    const customActions = [<FlatButton
    label="Close"
    primary={true}
    onTouchTap={this.handleDialogClose} />];

    return (
      <Dialog  ref="dialog"
            title={this.props.title}
            actions={customActions}
  			autoDetectWindowHeight={true}
  			autoScrollBodyContent={true}>
  			<Markdown source={this.props.markdown}/>
     	  </Dialog>
    );
  }

  handleDialogClose = () => {
    this.refs.dialog.dismiss();
  };

}

export default MarkdownModal;
