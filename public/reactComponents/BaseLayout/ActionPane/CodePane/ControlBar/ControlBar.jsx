import React from 'react';
import {Toolbar, ToolbarGroup, ToolbarSeparator, IconButton, FlatButton} from 'material-ui';

/* clicking buttons on the DynamicControlBar either sends
   commands to the Sequencer, which triggers changes in 
   the CodeStatusStore and thus disables/enables various 
   buttons on callback, or the CodeStatusStore is 
   set directly, which the Sequencer checks on each update
   cycle as well as calling back to enable/disable buttons here. */

import CodeStatusStore from '../../../../../modules/stores/CodeStatusStore.js';
import Sequencer from '../../../../../modules/Sequencer/Sequencer.js';

class ControlBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      allowResetButton: false,
    };
  }

  static propTypes = {
    showDynamic: React.PropTypes.bool,
    codeParsed: React.PropTypes.bool,
    codeRunning: React.PropTypes.bool,
  }

  onPlay = () => {
    CodeStatusStore.setCodeRunning(true);
    this.setState({
      allowResetButton: true,
    });
    Sequencer.update();
  }

  onPause = () => {
    CodeStatusStore.setCodeRunning(false);
  }

  onAdvance = () => {
    CodeStatusStore.setCodeRunning(true);
    this.setState({
      allowResetButton: true,
    });
    Sequencer.update(true);
  }

  onReset = () => {
    CodeStatusStore.setCodeRunning(false);
    this.setState({
      allowResetButton: false,
    });
    Sequencer.restart();
  }

  onParse = () => {
    CodeStatusStore.setCodeParsed(true);
    if (this.props.showDynamic) {
      Sequencer.initialize();
    }
  }

  render = () => {
    return (
      <Toolbar style={{backgroundColor: 'lightgrey', display: 'flex', 'alignItems': 'center', justifyContent: 'space-around'}}>
        <ToolbarGroup>
          <IconButton disabled={!this.props.showDynamic || !this.props.codeParsed || this.props.codeRunning || this.props.codeFinished} onClick={this.onPlay} style={{'zIndex': 5, width: '70px'}} tooltip="Play or resume dynamic execution"><i className="material-icons">play_arrow</i></IconButton>
          <IconButton disabled={!this.props.showDynamic || !this.props.codeParsed || !this.props.codeRunning || this.props.codeFinished} onClick={this.onPause} style={{'zIndex': 5, width: '70px'}} tooltip="Pause dynamic execution"><i className="material-icons">pause</i></IconButton>
          <IconButton disabled={!this.props.showDynamic || !this.props.codeParsed || this.props.codeRunning || this.props.codeFinished} onClick={this.onAdvance} style={{'zIndex': 5, width: '70px'}} tooltip="Advance one step"><i className="material-icons">skip_next</i></IconButton>
          <IconButton disabled={!this.props.showDynamic || !this.props.codeParsed || !this.state.allowResetButton} onClick={this.onReset} style={{'zIndex': 10}} tooltip="Stop and reset execution to start"><i className="material-icons">replay</i></IconButton>
        </ToolbarGroup>
        <ToolbarSeparator style={{'top': 0, 'margin': '0 12px 0 12px'}}/>
        <ToolbarGroup>
          <FlatButton disabled={this.props.codeParsed} onClick={this.onParse} label="Parse code"  />
        </ToolbarGroup>
      </Toolbar>
    );
  }

}

export default ControlBar;
