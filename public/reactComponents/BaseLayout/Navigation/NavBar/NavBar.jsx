/*
All setting of the RefreshStore is done directly through here.
*/

import React from 'react';
import mui from 'material-ui';
import NavigationStore from '../../../../modules/stores/NavigationStore.js';
import ConstantStore from '../../../../modules/stores/ConstantStore.js';
import CodeStore from '../../../../modules/stores/CodeStore.js';
import CodeStatusStore from '../../../../modules/stores/CodeStatusStore.js';

const LeftNav = mui.LeftNav;
const MenuItem = mui.MenuItem;

class NavBar {

  static propTypes = {
    menuItems: React.PropTypes.array.isRequired,
  }

  static defaultProps = {
    menuItems: [{
      type: MenuItem.Types.SUBHEADER,
      text: 'Program walkthrough',
    }].concat(ConstantStore.getConstants().codeExamples
      .map((example, i) => {
        return ({
          optionGroup: 'codeExamples',
          text: (i + 1) + ': ' + example.title,
          index: i,
        });
      })).concat([{
      type: MenuItem.Types.SUBHEADER,
      text: 'Docs',
    }, {
      type: MenuItem.Types.LINK,
      payload: 'https://github.com/breakingco/functional-visualiser',
      text: 'GitHub source',
    }, {
      optionGroup: 'markdown',
      text: 'Early deliverable',
      id: 'earlyDeliverable',
    }, {
      optionGroup: 'markdown',
      payload: 'https://www.google.com',
      text: 'Dissertation',
      'id': 'dissertation',
      disabled: true,
    }, ])
  }

  componentDidMount = () => {
    NavigationStore.subscribeListener(this.onNavigationStoreChange);
    this.setNavBarState();
  }

  componentWillUnmount = () => {
    NavigationStore.unsubscribeListener(this.onNavigationStoreChange);
  }


  onNavClose() {
    NavigationStore.setOptions({
      isNavBarShowing: false,
    });
  }

  onNavigationStoreChange = () => {
    this.setNavBarState();
  }

  setNavBarState = () => {
    if (NavigationStore.isNavBarShowing()) {
      this.refs.leftNav.toggle();
    }
  }

  handleClick = (e, selectedIndex, menuItem) => {
    let constants = ConstantStore.getConstants();
    switch (menuItem.optionGroup) {
      case 'codeExamples':
        // user has selected pre-written example; this resets the user-typed code.
        let staticCodeExample =
          constants[menuItem.optionGroup][menuItem.index].func;
        CodeStore.set(staticCodeExample, false, true);
        CodeStatusStore.setCodeParsed(false);
        break;

      case 'markdown':
        let selectedMarkdown = constants[menuItem.optionGroup][menuItem.id];
        NavigationStore.setOptions({
          selectedMarkdown,
        });
        break;
    }
  }

  render() {
    return (
      <div>
      <LeftNav ref="leftNav"
            menuItems={this.props.menuItems}
            docked={false}
            style={{'lineHeight': 1.5}}
            onChange={this.handleClick}
            onNavClose={this.onNavClose} />
      </div>
    );
  }

}

export default NavBar;
