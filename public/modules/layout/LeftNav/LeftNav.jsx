import React from 'react';
import mui from 'material-ui';

let LeftNav = mui.LeftNav;
let MenuItem = mui.MenuItem;

export default class LeftNavBar {

    static displayName = 'LeftNavBar';

    static defaultProps = {
        menuItems: [{
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
        }, ]
    }

    handleClick = () => {
        console.log('handlingclick');
        this.toggle();
    }

    componentDidMount() {
        console.log('left nav mounted');
       // this.refs.leftNav.toggle();
    }

    componentWillReceiveProps(nextProps){
        console.log('left nav has received props');
        console.log(nextProps);
    }

    componentWillUpdate () {
        console.log('left nav updating');
    }

    componentDidUpdate (){
        console.log('left nav updated');
    }
    render() {
        return (
            <LeftNav ref="leftNav"
            menuItems={this.props.menuItems}
            docked={false}
            onChange={this.handleClick}
            className="left-nav" />)
    }
};