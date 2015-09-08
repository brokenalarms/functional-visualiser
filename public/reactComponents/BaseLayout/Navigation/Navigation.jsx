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
      warning: {},
  };
}

componentDidUpdate = () => {
  if (this.state.warning.message) {
    this.refs.snackbar.show();
    SequencerStore.setWarningMessageShown();
  } else {
    this.refs.snackbar.dismiss();
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
    warning: {},
  });
}

onSequencerStoreUpdate = () => {
  let warning = SequencerStore.getWarning();
  if (warning) {
    this.setState({
      warning,
    });
  } else {
    this.setState({
      warning: {},
    });
  }
}

dismissSnackbar = () => {
  if (this.refs.snackbar) {
    if (this.state.furtherReadingLink) {
      window.open(this.state.furtherReadingLink);
    } else {
      this.refs.snackbar.dismiss();
    }
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
          action={this.state.warning.action}
          message={this.state.warning.message}
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
