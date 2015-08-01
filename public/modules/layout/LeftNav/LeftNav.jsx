import React from 'react';
import mui from 'material-ui';

let LeftNav = mui.LeftNav;
let MenuItem = mui.MenuItem;

export default class LeftNavBar {

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

    constructor(props) {}

    render() {
        return (
            <LeftNav ref="leftNav" menuItems={this.props.menuItems} docked={true} className="left-nav"/>)
    }
};
