'use strict';

import React from 'react';
import drawFunc from './components/functionBlock/functionBlock.jsx'

class App extends React.Component {
    render() {
        return (
        	<div>
            <h1>react working!</h1>
			<div className="d3-test">element that d3 is attached to</div>
			</div>
        )
    }
}

React.render(<App />, document.getElementById('app'));


drawFunc();
