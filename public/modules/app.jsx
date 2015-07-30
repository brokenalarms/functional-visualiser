'use strict';
//==========================================
// Main root-level app module.
// The whole application is defined by the 'App'
// React component, and all state flows uni-directionally
// down from it.
//==========================================

import React from 'react';
//import drawFunc from './components/functionBlock/functionBlock.jsx'

import theme from './theme';
import mui from 'material-ui';
let LeftNav = mui.LeftNav;

import D3Root from './D3Root/D3Root.jsx'

let menuItems = [
  { route: 'get-started', text: 'Get Started' },
  { route: 'customization', text: 'Customization' },
  { route: 'components', text: 'Components' },
  { 
     text: 'Disabled', 
     disabled: true 
  }
];
var App = function() {
    return {
        render() {
            return (<div>
            <h1>react working! {word}</h1>
              <LeftNav label="Default" menuItems={menuItems} />
			<D3Root word={word} />
			</div>)
        }
    }
};
var word = 'baallaoeuoea';

React.render(<App word={word}/>, document.getElementById('app'));
