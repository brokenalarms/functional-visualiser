import React from 'react';
import {AppBar} from 'material-ui';

import optionStore from '../../modules/stores/optionStore.js';
import NavBar from './NavBar/NavBar.jsx';
import ActionPane from './ActionPane/ActionPane.jsx';
import MarkdownModal from './MarkdownModal/MarkdownModal.jsx';

/*
  Central controller for all state in the app.
  Using principles of functional reactive programming (FRP),
  state is mutated imperatively in the NavBar only, handlede here,
  and declarative code in the children components react to this
  and propogate the state change through the system.
*/

class Controller extends React.Component {

  constructor() {
    super();
    this.displayName = 'Controller';
    this.state = {
      showNavBar: false,
      // TODO - TESTING - to be changed to null
      selectedExample: optionStore.getOptions().examples.sum.functional,
      selectedMarkdown: null,
    };
  }

  componentDidMount = () => {
    optionStore.subscribeListener(this.onOptionsChanged);
  }

  componentWillUnmount = () => {
    optionStore.unsubscribeListener(this.onOptionsChanged);
  }

  showMenuOnClick = (shouldShow) => {
    this.setState({
      showNavBar: shouldShow,
    });
  }

  onOptionsChanged = () => {
    this.setState({
      lastClickedItem: optionStore.getOptions().lastClickedItem,
      selectedExample: optionStore.getOptions().selectedExample,
      selectedMarkdown: optionStore.getOptions().selectedMarkdown,
    });
  }

  render = () => {
    let modal = (this.state.selectedMarkdown &&
        this.state.lastClickedItem.type === 'markdown' && !this.state.showNavBar) ?
      <MarkdownModal
        markdown={this.state.selectedMarkdown}/> :
      null;
    return (
      <div>
          <AppBar
            title="Functional Visualiser Demo"
            onLeftIconButtonTouchTap={this.showMenuOnClick.bind(this, true)}
          />
          <NavBar
            showNavBar={this.state.showNavBar}
            onNavClose={this.showMenuOnClick.bind(this, false)}
          />
          <ActionPane example={this.state.selectedExample}
          isNavBarShowing={this.state.showNavBar}/>
          {modal}
       </div>
    );
  }


}

export default Controller;
