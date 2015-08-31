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
    showNavBar: React.PropTypes.bool.isRequired,
    onNavClose: React.PropTypes.func.isRequired,
  }

  static defaultProps = {
    menuItems: [{
      type: MenuItem.Types.SUBHEADER,
      text: 'Examples',
    }, {
      optionGroup: 'codeExamples',
      text: 'Sum: imperative',
      moduleId: 'assorted',
      functionId: 'imperativeSum',
    }, {
      optionGroup: 'codeExamples',
      text: 'Sum: functional',
      moduleId: 'assorted',
      functionId: 'functionalSum',
    }, {
      optionGroup: 'codeExamples',
      text: 'Nested return',
      moduleId: 'assorted',
      functionId: 'nestedReturn',
    }, {
      optionGroup: 'codeExamples',
      text: 'Fibonacci: recursion',
      moduleId: 'assorted',
      functionId: 'fibonacciRecursive',
    }, {
      optionGroup: 'codeExamples',
      text: 'Smashing Magazine demo',
      moduleId: 'smashingMagazineDemo',
      functionId: 'demo',
    }, {
      type: MenuItem.Types.SUBHEADER,
      text: 'Docs',
    }, {
      type: MenuItem.Types.LINK,
      payload: 'https://github.com/breakingco/functional-visualiser',
      text: 'GitHub source',
    }, {
      optionGroup: 'markdown',
      text: 'Early Deliverable',
      id: 'earlyDeliverable',
    }, {
      optionGroup: 'markdown',
      payload: 'https://www.google.com',
      text: 'Dissertation',
      'id': 'dissertation',
      disabled: true,
    }, ],
  }

  componentDidMount = () => {
    if (this.props.showNavBar) {
      this.refs.leftNav.toggle();
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.showNavBar;
  }

  componentDidUpdate() {
    this.refs.leftNav.toggle();
  }

  handleClick = (e, selectedIndex, menuItem) => {
    let constants = ConstantStore.getConstants();
    switch (menuItem.optionGroup) {
      case 'codeExamples':
        // user has selected pre-written example; this resets the user-typed code.
        let staticCodeExample =
          constants[menuItem.optionGroup][menuItem.moduleId][menuItem.functionId];
        CodeStore.set(staticCodeExample);
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
            onNavClose={this.props.onNavClose} />
      </div>
    );
  }

}

export default NavBar;
