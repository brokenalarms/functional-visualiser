'use strict';
// ==========================================
// Main root-level app module.
// The App class is used purely to set up theme boilerplate.
// ==========================================

// dependencies
import React from 'react';
import mui from 'material-ui';
import injectTapEventPlugin from 'react-tap-event-plugin';

// React components
import BaseLayout from './BaseLayout/BaseLayout.jsx';

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
        <BaseLayout/>
      </div>
    );
  }
}

export default App;
