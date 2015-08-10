'use strict';
// ==========================================
// Main root-level app module.
// The App class is used purely to set up boilerplate.
// Subscriptions to data begin in the 'Controller'
// React component, and all state flows uni-directionally
// down from the 'Controller' module.
// ==========================================

// dependencies
import React from 'react';
import mui from 'material-ui';
import injectTapEventPlugin from 'react-tap-event-plugin';

// React components
import Controller from './Controller/Controller.jsx';

class App extends React.Component {

  // boilerplate for material-UI initialisation
  static childContextTypes = {
    muiTheme: React.PropTypes.object,
  }

  constructor(props) {
    super(props);
    // boilerplate for Material-UI initialisation
    this.ThemeManager = new mui.Styles.ThemeManager();
    this.ThemeManager.setTheme(this.ThemeManager.types.DARK);
    injectTapEventPlugin();
    this.state = {
      showNavBar: true,
    };
  }

  // boilerplate for material-UI initialisation
  getChildContext() {
    return {
      muiTheme: this.ThemeManager.getCurrentTheme(),
    };
  }

  render() {
    return (
      <div className="app">
        <Controller/>
      </div>
    );
  }
}

export default App;
