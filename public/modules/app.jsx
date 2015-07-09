'use strict';

import React from 'react';

class App extends React.Component {
    render() {
        return (
            <h1>react!</h1>
            <FunctionBlock />
        )
    }
}

React.render(<App />, document.getElementById('app'));

//import drawFunc from './components/functionBlock/functionBlock.jsx'


//drawFunc();
