'use strict';
//==========================================
// Main root-level app module.
// The whole application is defined by the 'App'
// React component, and all state flows uni-directionally
// down from it.
//==========================================

import React from 'react';
import mui from 'material-ui';
import D3Root from './layout/D3Root/D3Root.jsx';
import LeftNavBar from './layout/LeftNav/LeftNav.jsx';
let RaisedButton = mui.RaisedButton;


let ThemeManager = new mui.Styles.ThemeManager();
ThemeManager.setTheme(ThemeManager.types.DARK);


class App extends React.Component {


    //boilerplate for material-UI initialisation
    static childContextTypes = {
        muiTheme: React.PropTypes.object
    }

    constructor(props) {
        super(props);
        this.defaultProps = {
            word: 1,
            showNavBar: false
        };
        this.state = {
            word: 1,
            inputContent: 'start value',
            showNavBar: true
        }
    }

    //boilerplate for material-UI initialisation
    getChildContext() {
        return {
            muiTheme: ThemeManager.getCurrentTheme()
        };
    }

    handleButtonClick = () => {
        console.log('button clicked');
        this.setState({
            word: ++this.state.word,
            showNavBar: !this.state.showNavBar
        });
    }

    render() {
        return (<div className='test'>
                    <LeftNavBar />
                    <div>
                        <RaisedButton label="Default" onClick={this.handleButtonClick}/>
                        <h1>react working! {this.state.word}</h1>
                        <D3Root word={this.props.word} />
                    </div>
            </div>)
    }

}

React.render(<App />, document.getElementById('app'));
