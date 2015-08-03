import React from 'react';

import LeftNavBar from './LeftNav/LeftNav.jsx';
import {AppBar} from 'material-ui';

/* PRACTICE - exporting a react component as a plain JS function (no classes)
   Eric Eliott style...
   I will switch to ES6 classes now, even though this is against prototypical
   inheritance the linting integration is better.
*/

function Controller() {
  const instance = Object.create(React.Component.prototype);

  Object.assign(instance, {
    constructor: instance,
    displayName: 'Controller',
    state: {
      showNavBar: true,
    },
    render() {
      return (
        <div>
        {this.props.word}
          <AppBar
            title="Functional Visualiser Demo"
            onLeftIconButtonTouchTap={instance.showMenuOnClick.bind(instance, true)}
          />
          <LeftNavBar
            showNavBar={instance.state.showNavBar}
            onNavClose={instance.showMenuOnClick.bind(instance, false)}
          />
       </div>
      );
    },

    showMenuOnClick(shouldShow) {
      instance.setState({
        showNavBar: shouldShow,
      });
    },
  });

  return instance;
}

export default Controller;
