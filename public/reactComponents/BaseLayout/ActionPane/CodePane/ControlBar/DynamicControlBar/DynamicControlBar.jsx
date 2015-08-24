import React from 'react';
import {Toolbar, ToolbarGroup, ToolbarSeparator, IconButton, FlatButton} from 'material-ui';

import SequencerStore from '../../../../../../modules/stores/SequencerStore.js';
import CodeStore from '../../../../../../modules/stores/CodeStore.js';
import Sequencer from '../../../../../../modules/Sequencer/Sequencer.js';

class DynamicControlBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      codeParsed: false,
      codeRunning: false,
      codeErrors: false,
    };
  }

  onPlay = () => {
    let codeRunning = SequencerStore.getState().codeRunning = true;
    this.setState({
      codeRunning,
    });
    Sequencer.update();
  }

  onPause = () => {
    let codeRunning = SequencerStore.getState().codeRunning = false;
    this.setState({
      codeRunning,
    });
  }

  onAdvance() {
    Sequencer.update(true);
  }

  onReset = () => {
    this.setState({
      codeRunning: false,
    });
    Sequencer.restart();
  }

  onParse = () => {
    this.setState({
      codeParsed: true,
    });
    Sequencer.initialize();
  }

  onEditorCodeChanged = () => {
    if (CodeStore.get() !== null) {
      // no errors, OK to parse
      this.setState({
        codeParsed: false,
        codeRunning: false,
        codeErrors: false,
      });
    } else {
      this.setState({
        codeParsed: false,
        codeRunning: false,
        codeErrors: true,
      });
    }

  }

  componentDidMount() {
    CodeStore.subscribeListener(this.onEditorCodeChanged);
  }

  render = () => {
    return (
      <Toolbar style={{display: 'flex', 'alignItems': 'center', justifyContent: 'space-around'}}>
        <ToolbarGroup>
          <IconButton disabled={!this.state.codeParsed || this.state.codeRunning} onClick={this.onPlay} style={{'zIndex': 3}} tooltip="Play or resume dynamic execution"><i className="material-icons">play_arrow</i></IconButton>
          <IconButton disabled={!this.state.codeParsed || !this.state.codeRunning} onClick={this.onPause} style={{'zIndex': 3}} tooltip="Pause dynamic execution"><i className="material-icons">pause</i></IconButton>
          <IconButton disabled={!this.state.codeParsed || this.state.codeRunning} onClick={this.onAdvance} style={{'zIndex': 3}} tooltip="Advance one step"><i className="material-icons">skip_next</i></IconButton>
          <IconButton disabled={!this.state.codeParsed} onClick={this.onReset} style={{'zIndex': 10}} tooltip="Stop and reset execution to start"><i className="material-icons">replay</i></IconButton>
        </ToolbarGroup>
        <ToolbarSeparator style={{'top': 0, 'margin': '0 12px 0 12px'}}/>
        <ToolbarGroup>
          <FlatButton disabled={this.state.codeErrors || this.state.codeParsed} onClick={this.onParse} label="Parse editor code" primary={true} />
        </ToolbarGroup>
      </Toolbar>
    );
  }

}

export default DynamicControlBar;
