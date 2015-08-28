import React from 'react';
import {Toolbar, ToolbarGroup, ToolbarSeparator, IconButton, FlatButton} from 'material-ui';

/* clicking buttons on the DynamicControlBar either sends
   commands to the Sequencer, which triggers changes in 
   the LiveOptionStore and thus disables/enables various 
   buttons on callback, or the LiveOptionStore is 
   set directly, which the Sequencer checks on each update
   cycle as well as calling back to enable/disable buttons here. */

import CodeStore from '../../../../../../modules/stores/CodeStore.js';
import LiveOptionStore from '../../../../../../modules/stores/LiveOptionStore.js';
import Sequencer from '../../../../../../modules/Sequencer/Sequencer.js';

class DynamicControlBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      codeParsed: false,
      codeRunning: LiveOptionStore.isCodeRunning(),
      allowResetButton: false,
    };
  }

  onPlay = () => {
    LiveOptionStore.setCodeRunning(true);
    Sequencer.update();
  }

  onPause = () => {
    LiveOptionStore.setCodeRunning(false);
  }

  onAdvance = () => {
    LiveOptionStore.setCodeRunning(true);
    Sequencer.update(true);
  }

  onReset = () => {
    this.setState({
      allowResetButton: false,
    });
    Sequencer.restart();
  }

  onParse = () => {
    Sequencer.initialize();
    this.setState({
      codeParsed: true,
      allowResetButton: false,
    });
  }

  handleCodeStoreChange = () => {
    // reset buttons; code has changed in editor
    // but doesn't matter if the code hasn't yet
    // been parsed (which happens when the code
    // is initially read in and replaced with an
    // IIFE)
    if (this.state.codeParsed) {
      this.setState({
        codeParsed: false,
      });
    }
  }

  handleLiveOptionStoreChange = () => {
    // loop back from button presses to disable / enable state
    this.setState({
      codeRunning: LiveOptionStore.isCodeRunning(),
      allowResetButton: true,
    });
  }

  componentDidMount() {
    CodeStore.subscribeListener(this.handleCodeStoreChange);
    LiveOptionStore.subscribeListener(this.handleLiveOptionStoreChange);
  }

  render = () => {
    return (
      <Toolbar style={{display: 'flex', 'alignItems': 'center', justifyContent: 'space-around'}}>
        <ToolbarGroup>
          <IconButton disabled={!this.state.codeParsed || this.state.codeRunning} onClick={this.onPlay} style={{'zIndex': 3}} tooltip="Play or resume dynamic execution"><i className="material-icons">play_arrow</i></IconButton>
          <IconButton disabled={!this.state.codeParsed || !this.state.codeRunning} onClick={this.onPause} style={{'zIndex': 3}} tooltip="Pause dynamic execution"><i className="material-icons">pause</i></IconButton>
          <IconButton disabled={!this.state.codeParsed || this.state.codeRunning} onClick={this.onAdvance} style={{'zIndex': 3}} tooltip="Advance one step"><i className="material-icons">skip_next</i></IconButton>
          <IconButton disabled={!this.state.codeParsed || !this.state.allowResetButton} onClick={this.onReset} style={{'zIndex': 10}} tooltip="Stop and reset execution to start"><i className="material-icons">replay</i></IconButton>
        </ToolbarGroup>
        <ToolbarSeparator style={{'top': 0, 'margin': '0 12px 0 12px'}}/>
        <ToolbarGroup>
          <FlatButton disabled={this.state.codeParsed} onClick={this.onParse} label="Parse editor code" primary={true} />
        </ToolbarGroup>
      </Toolbar>
    );
  }

}

export default DynamicControlBar;
