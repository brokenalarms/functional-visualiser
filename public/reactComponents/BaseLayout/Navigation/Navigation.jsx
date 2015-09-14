/*
  Responsible for showing/hiding main NavBar
  and UserOptions components.
*/

import React from 'react';
import {AppBar} from 'material-ui';
import NavBar from './NavBar/NavBar.jsx';
import OptionMenu from './OptionMenu/OptionMenu.jsx';
import MarkdownModal from './MarkdownModal/MarkdownModal.jsx';
import ErrorPopup from './ErrorPopup/ErrorPopup.jsx';
import NavigationStore from '../../../modules/stores/NavigationStore.js';

class Navigation extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isNavBarShowing: NavigationStore.isNavBarShowing(),
      selectedMarkdown: NavigationStore.getSelectedMarkdown(),
      warning: null,
    };
  }

  shouldComponentUpdate() {
    // every element is a persistent popup
    // with its own subscription to relevant events
    return false;
  }

  setNavBarShowing = () => {
    NavigationStore.setOptions({
      isNavBarShowing: true,
    });
  }

  render = () => {
    return (
      <div>
        <AppBar
         style={{backgroundColor: '#2aa198'}}
          title="Functional Visualiser"
          iconElementRight={<OptionMenu />}
          onLeftIconButtonTouchTap={this.setNavBarShowing} />
        <MarkdownModal 
          selectedMarkdown={this.state.selectedMarkdown}
          zDepth={5}/>
        <NavBar />
        <ErrorPopup />
      </div>
    );
  }
}

export default Navigation;
