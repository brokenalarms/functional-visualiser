import React from 'react';
import mui from 'material-ui';

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
      route: 'get-started',
      text: 'Get Started',
    }, {
      route: 'customization',
      text: 'Customization',
    }, {
      route: 'components',
      text: 'Components',
    }, {
      type: MenuItem.Types.SUBHEADER,
      text: 'Resources',
    }, {
      type: MenuItem.Types.LINK,
      payload: 'https://github.com/callemall/material-ui',
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
    this.refs.leftNav.toggle();
    this.handleNavClose = this.props.onNavClose.bind(this, false);
  }

  componentWillUpdate() {
  }

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
            onNavClose={this.handleNavClose} />
    );
  }

  handleClick = () => {
    console.log('handling nav bar click');
  }
}
