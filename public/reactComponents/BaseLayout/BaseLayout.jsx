/*
  Responsible for showing/hiding main NavBar
  and UserOptions components.
  Markdownmodal subscribes to OptionStore separately
  so as to not trigger re-render of ActionPane
  on modal view.
*/

import React from 'react';
import {AppBar, IconButton, Slider} from 'material-ui';
import NavBar from './NavBar/NavBar.jsx';
import OptionMenu from './OptionMenu/OptionMenu.jsx';
import ActionPane from './ActionPane/ActionPane.jsx';
import MarkdownModal from './MarkdownModal/MarkdownModal.jsx';


class BaseLayout extends React.Component {

  constructor(props) {
    super(props);
    this.displayName = 'BaseLayout';
    this.state = {
      isNavBarShowing: false,
    };
  }

  setIsNavBarShowing = (isNavBarShowing) => {
    this.setState({
      isNavBarShowing,
    });
  }

  render = () => {

    return (
      <div>
      <MarkdownModal zDepth={5}/>
          <AppBar
            title="Functional Visualiser Prototype"
            iconElementRight={<OptionMenu />}
            onLeftIconButtonTouchTap={this.setIsNavBarShowing.bind(this, true)} />
          <NavBar
            showNavBar={this.state.isNavBarShowing}
            onNavClose={this.setIsNavBarShowing.bind(this, false)}
          />
          <ActionPane isNavBarShowing={this.state.isNavBarShowing}/>
       </div>
    );
  }


}

export default BaseLayout;
