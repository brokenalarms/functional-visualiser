'use strict';
// ==========================================
// Main root-level app module.
// The App class is used purely to set up theme boilerplate.
// ==========================================

// dependencies
import React from 'react';
import mui from 'material-ui';
import injectTapEventPlugin from 'react-tap-event-plugin';
import BaseLayout from './BaseLayout/BaseLayout.jsx';

// boilerplate for material-UI initialisation
let ThemeManager = new mui.Styles.ThemeManager();
ThemeManager.setTheme(ThemeManager.types.DARK);
injectTapEventPlugin();

class App extends React.Component {

  static childContextTypes = {
    muiTheme: React.PropTypes.object,
  }

  constructor(props) {
    super(props);
    // boilerplate for Material-UI initialisation
    this.state = {
      showNavBar: true,
    };
  }

  // boilerplate for material-UI initialisation
  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme(),
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
