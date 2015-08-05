/*
All setting of the optionStore is done directly through here.
*/

import React from 'react';
import mui from 'material-ui';
import optionStore from '../../../modules/stores/optionStore.js';

const LeftNav = mui.LeftNav;
const MenuItem = mui.MenuItem;

export default class LeftNavBar {
  static displayName = 'LeftNavBar';

  static propTypes = {
    showNavBar: React.PropTypes.bool.isRequired,
    onNavClose: React.PropTypes.func.isRequired,
  }

  static defaultProps = {
    menuItems: [{
      type: MenuItem.Types.SUBHEADER,
      text: 'Examples',
    }, {
      route: 'get-started',
      text: 'Sum',
      id: 'sum',
    }, {
      route: 'customization',
      text: 'Customization',
    }, {
      route: 'components',
      text: 'Components',
    }, {
      type: MenuItem.Types.SUBHEADER,
      text: 'Examples',
    }, {
      type: MenuItem.Types.LINK,
      payload: 'https://github.com/breakingco/functional-visualiser',
      text: 'GitHub',
    }, {
      text: 'Disabled',
      disabled: true,
    }, {
      type: MenuItem.Types.LINK,
      payload: 'https://www.google.com',
      text: 'Disabled Link',
      disabled: true,
    }, ],
  }

  componentDidMount = () => {
   // this.refs.leftNav.toggle();
    // console.log(MenuItem.Types);
  }

  componentWillUpdate() {}

  componentDidUpdate() {
    // only show navBar if allowed by parent
    if (this.props.showNavBar) {
      this.refs.leftNav.toggle();
    }
  }
  render() {
    return (
      <LeftNav ref="leftNav"
            menuItems={this.props.menuItems}
            docked={false}
            onChange={this.handleClick}
            onNavClose={this.props.onNavClose.bind(this, false)} />
    );
  }

  handleClick = (e, selectedIndex, menuItem) => {
    // console.log(menuItem);
    optionStore.setOptions({
      selectedExampleId: menuItem.id,
    });
  };
}
