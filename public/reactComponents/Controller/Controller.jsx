import React from 'react';
import {AppBar} from 'material-ui';

import optionStore from '../../modules/stores/optionStore.js';
import NavBar from './NavBar/NavBar.jsx';
import ActionPane from './ActionPane/ActionPane.jsx';

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
      selectedExample: optionStore.getOptions().selectedExample,
    });
  }

  render = () => {
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
       </div>
    );
  }


}

export default Controller;
