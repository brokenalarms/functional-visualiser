'use strict';
//==========================================
// Main root-level app module.
// The whole application is defined by the 'App'
// React component, and all state flows uni-directionally
// down from it.
//==========================================

import React from 'react';
//import drawFunc from './components/functionBlock/functionBlock.jsx'

//Set up React Material UI with Dark theme
import mui from 'material-ui';
let themeManager = new mui.Styles.ThemeManager();

import D3Root from './D3Root/D3Root.jsx'

var App = function() {
    return {
        render() {
            return (<div>
            <h1>react working! {word}</h1>
			<D3Root word={word} />
			</div>)
        }
    }
};
var word = 'baallaoeuoea';

React.render(<App word={word}/>, document.getElementById('app'));
