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
    menuItems: React.PropTypes.array.isRequired,
    showNavBar: React.PropTypes.bool.isRequired,
    onNavClose: React.PropTypes.func.isRequired,
  }

  static defaultProps = {
    menuItems: [{
      type: MenuItem.Types.SUBHEADER,
      text: 'Examples',
    }, {
      type: 'example',
      text: 'Sum: imperative',
      moduleId: 'sum',
      programType: 'imperative',
    }, {
      type: 'example',
      text: 'Sum: functional',
      moduleId: 'sum',
      programType: 'functional',
    }, {
      type: MenuItem.Types.SUBHEADER,
      text: 'Docs',
    }, {
      type: MenuItem.Types.LINK,
      payload: 'https://github.com/breakingco/functional-visualiser',
      text: 'GitHub source',
    }, {
      type: 'markdown',
      text: 'Early Deliverable',
      id: 'earlyDeliverable',
    }, {
      type: 'markdown',
      payload: 'https://www.google.com',
      text: 'Dissertation',
      'id': 'dissertation',
      disabled: true,
    }, ],
  }

  componentDidMount = () => {
    // TODO - uncomment
    // this.refs.leftNav.toggle();
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
    switch (menuItem.type) {
      case 'example':
        optionStore.setOptions({
          selectedExample: optionStore.getOptions().examples[menuItem.moduleId][menuItem.programType],
          lastClickedItem: menuItem,
        });
        break;
      case 'markdown':
        optionStore.setOptions({
          selectedMarkdown: menuItem.id,
          lastClickedItem: menuItem,
        });

    }
  };
}
