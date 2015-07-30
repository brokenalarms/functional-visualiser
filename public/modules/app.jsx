'use strict';
//==========================================
// Main root-level app module.
// The whole application is defined by the 'App'
// React component, and all state flows uni-directionally
// down from it.
//==========================================

import React from 'react';
import mui from 'material-ui';
import D3Root from './D3Root/D3Root.jsx'
var ThemeManager = new mui.Styles.ThemeManager();

var LeftNav = mui.LeftNav,
    RaisedButton = mui.RaisedButton,
    MenuItem = mui.MenuItem,
    menuItems = [{
        route: 'get-started',
        text: 'Get Started'
    }, {
        route: 'customization',
        text: 'Customization'
    }, {
        route: 'components',
        text: 'Components'
    }, {
        type: MenuItem.Types.SUBHEADER,
        text: 'Resources'
    }, {
        type: MenuItem.Types.LINK,
        payload: 'https://github.com/callemall/material-ui',
        text: 'GitHub'
    }, {
        text: 'Disabled',
        disabled: true
    }, {
        type: MenuItem.Types.LINK,
        payload: 'https://www.google.com',
        text: 'Disabled Link',
        disabled: true
    }, ];

class App {

    constructor() {
        //Set up React Material UI with Dark theme
        ThemeManager.setTheme(ThemeManager.types.DARK);
    }

    //boilerplate for material-UI initialisation
    getChildContext() {
        return {
            muiTheme: ThemeManager.getCurrentTheme()
        };
    }
    render() {
        return (<div>
       <RaisedButton label="Default"/>
      <LeftNav ref="leftNav" docked={false} menuItems={menuItems} />
            <h1>react working! {word}</h1>
            <D3Root word={word} />
       </div>)
    }
};
//boilerplate for material-UI initialisation
App.childContextTypes = {
    muiTheme: React.PropTypes.object
};

var word = 'baallaoeuoea';

React.render(<App word={word}/>, document.getElementById('app'));
