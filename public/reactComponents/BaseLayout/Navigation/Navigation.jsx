/*
  Responsible for showing/hiding main NavBar
  and UserOptions components.
*/

import React from 'react';
import {AppBar} from 'material-ui';
import NavBar from './NavBar/NavBar.jsx';
import OptionMenu from './OptionMenu/OptionMenu.jsx';
import MarkdownModal from './MarkdownModal/MarkdownModal.jsx';
import NavigationStore from '../../../modules/stores/NavigationStore.js';


class Navigation extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isNavBarShowing: NavigationStore.isNavBarShowing(),
      selectedMarkdown: NavigationStore.getSelectedMarkdown(),
    };
  }

  componentDidMount = () => {
    NavigationStore.subscribeListener(this.onNavigationStoreChange);
  }

  componentWillUnmount = () => {
    NavigationStore.unsubscribeListener(this.onNavigationStoreChange);
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
    });
  }

  render = () => {
    return (
      <div>
      <MarkdownModal 
        selectedMarkdown={this.state.selectedMarkdown}
        zDepth={5}/>
          <AppBar
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
