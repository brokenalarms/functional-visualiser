/*
All setting of the OptionStore is done directly through here.
*/

import React from 'react';
import mui from 'material-ui';
import OptionStore from '../../../modules/stores/OptionStore.js';

const LeftNav = mui.LeftNav;
const MenuItem = mui.MenuItem;

class NavBar extends React.Component {
  static displayName = 'NavBar';


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

  componentDidUpdate() {
    if (this.props.showNavBar) {
      this.refs.leftNav.toggle();
    }
  }
  render() {
    return (
      <div>
      <LeftNav ref="leftNav"
            menuItems={this.props.menuItems}
            docked={false}
            style={{'line-height': 1.5}}
            onChange={this.handleClick}
            onNavClose={this.props.onNavClose} />
      </div>
    );
  }

  handleClick = (e, selectedIndex, menuItem) => {
    switch (menuItem.optionGroup) {
      case 'codeExamples':
        let selectedCode =
          OptionStore.getOptions()[menuItem.optionGroup][menuItem.moduleId][menuItem.functionId];
        OptionStore.setOptions({
          selectedCode,
          clickedItem: menuItem,
        });
        break;
      case 'markdown':
        let selectedMarkdown = OptionStore.getOptions()[menuItem.optionGroup][menuItem.id];
        OptionStore.setOptions({
          selectedMarkdown,
          clickedItem: menuItem,
        });
        break;
    }
  };
}

export default NavBar;
