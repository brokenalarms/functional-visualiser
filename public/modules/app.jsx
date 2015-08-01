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
import LeftNavBar from './layout/LeftNav/LeftNav.jsx'
var ThemeManager = new mui.Styles.ThemeManager();
var RaisedButton = mui.RaisedButton;

class App extends React.Component {

    //boilerplate for material-UI initialisation
    static childContextTypes = {
        muiTheme: React.PropTypes.object
    };
    static defaultProps = {
        word: 1
    }

    constructor(props) {
        super(props);
        //Set up React Material UI with Dark theme
        ThemeManager.setTheme(ThemeManager.types.DARK);
        this.state = {
            word: 1,
            inputContent: 'start value'
        };
    }

    //boilerplate for material-UI initialisation
    getChildContext() {
        return {
            muiTheme: ThemeManager.getCurrentTheme()
        };
    }

    sendContent = (e) => {
        console.log('sending input content ' + this.state.inputContent);
    }

    changeContent = (e) => {
        this.setState({
            inputContent: e.target.value
        })
    }

    handleButtonClick = () => {
        console.log('button clicked');
        this.setState({
            word: ++this.state.word
        });
    }

    render() {
        console.log(React.version);
        return (<div className='test'>
                    {/*<LeftNavBar />*/}
                    <div>
                        <RaisedButton label="Default" onClick={this.handleButtonClick}/>
                        <h1>react working! {this.state.word}</h1>
                        <D3Root word={this.props.word} />
                    </div>
                    <div>
        <h4>The input form is here: {this.state.inputContent}</h4>
        Title: 
        <input type="text" value={this.inputContent} 
          onChange={this.changeContent} /> 
        <button onClick={this.sendContent}>Submit</button>
      </div>
            </div>)
    }
};

React.render(<App />, document.getElementById('app'));
