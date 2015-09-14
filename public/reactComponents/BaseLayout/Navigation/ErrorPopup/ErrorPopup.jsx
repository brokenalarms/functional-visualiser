import React from 'react';
import {Snackbar} from 'material-ui';
import SequencerStore from '../../../../modules/stores/SequencerStore.js';

class ErrorPopup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      warning: SequencerStore.getWarning(),
    };
  }

  componentDidUpdate() {
    if (this.state.warning) {
      this.refs.snackbar.show();
      SequencerStore.setWarningMessageShown();
    } else {
      this.refs.snackbar.dismiss();
    }
  }

  componentDidMount = () => {
    SequencerStore.subscribeListener(this.onSequencerStoreUpdate);
  }

  componentWillUnmount = () => {
    SequencerStore.unsubscribeListener(this.onSequencerStoreUpdate);
  }

  onSequencerStoreUpdate = () => {
    this.setState({
      warning: SequencerStore.getWarning(),
    });
  }

  dismissSnackbar = () => {
    this.refs.snackbar.dismiss();
  }

  render = () => {
    return (
      <Snackbar
        ref="snackbar"
        action={(this.state.warning) ? this.state.warning.action : ''}
        message={(this.state.warning) ? this.state.warning.message : ''}
        onActionTouchTap={this.dismissSnackbar}
        style={{maxWidth: 'auto'}}
      />
    );
  }
}

export default ErrorPopup;
