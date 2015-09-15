import React from 'react';
import {Snackbar} from 'material-ui';
import SequencerStore from '../../../../modules/stores/SequencerStore.js';
import RefreshStore from '../../../../modules/stores/RefreshStore.js';

class ErrorPopup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      warning: SequencerStore.getWarning(),
    };
  }

  componentDidUpdate() {
    if (this.state.warning &&
      !(RefreshStore.getOptions().showDynamic && 
        !SequencerStore.getOptions().stopOnNotices &&
        !SequencerStore.isSingleStep())) {
      this.refs.snackbar.show();
    } else {
      this.refs.snackbar.dismiss();
    }
    SequencerStore.setWarningMessageShown();
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
