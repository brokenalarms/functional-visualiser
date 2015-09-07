/*
  Responsible for showing/hiding main NavBar
  and UserOptions components.
*/

import React from 'react';
import {AppBar, Snackbar} from 'material-ui';
import NavBar from './NavBar/NavBar.jsx';
import OptionMenu from './OptionMenu/OptionMenu.jsx';
import MarkdownModal from './MarkdownModal/MarkdownModal.jsx';
import NavigationStore from '../../../modules/stores/NavigationStore.js';
import SequencerStore from '../../../modules/stores/SequencerStore.js';


class Navigation extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isNavBarShowing: NavigationStore.isNavBarShowing(),
      selectedMarkdown: NavigationStore.getSelectedMarkdown(),
      warningAction: null,
      warningMessage: null,
    };
  }

  componentDidUpdate = () => {
    if (this.state.warningMessage) {
      this.refs.snackbar.show();
      SequencerStore.setWarningMessageShown();
    }
  };

  componentDidMount = () => {
    NavigationStore.subscribeListener(this.onNavigationStoreChange);
    SequencerStore.subscribeListener(this.onSequencerStoreUpdate);
  }

  componentWillUnmount = () => {
    NavigationStore.unsubscribeListener(this.onNavigationStoreChange);
    SequencerStore.unsubscribeListener(this.onSequencerStoreUpdate);
  }

  setIsNavBarShowing = (isNavBarShowing) => {
    NavigationStore.setOptions({
      isNavBarShowing,
    });
  }

  onNavigationStoreChange = (newOpts) => {
    this.setState({
      isNavBarShowing: newOpts.isNavBarShowing,
      selectedMarkdown: newOpts.selectedMarkdown,
      warningAction: null,
      warningMessage: null,
    });
  }

  onSequencerStoreUpdate = () => {
    let warning = SequencerStore.getWarning();
    if (warning) {
      this.setState({
        warningAction: warning.action,
        warningMessage: warning.message,
      });
    } else {
      this.setState({
        warningAction: null,
        warningMessage: null,
      });
    }
  }

  dismissSnackbar = () => {
    if (this.refs.snackbar) {
      this.refs.snackbar.dismiss();
    }
  }

  render = () => {
    return (
      <div>
      <MarkdownModal 
        selectedMarkdown={this.state.selectedMarkdown}
        zDepth={5}/>
        <Snackbar
          ref="snackbar"
          action={this.state.warningAction}
          message={this.state.warningMessage}
          onActionTouchTap={this.dismissSnackbar}
          style={{maxWidth: 'auto'}}
        />
          <AppBar
            style={{backgroundColor: '#2aa198'}}
            title="Functional Visualiser"
            iconElementRight={<OptionMenu />}
            onLeftIconButtonTouchTap={this.setIsNavBarShowing.bind(this, true)} />
          <NavBar
            showNavBar={this.state.isNavBarShowing}
            onNavClose={this.setIsNavBarShowing.bind(this, false)}
          />
      </div>
    );
  }


}

export default Navigation;
