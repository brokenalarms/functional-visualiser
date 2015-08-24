import React from 'react';
import {Toolbar, ToolbarGroup, ToolbarSeparator, IconButton, FlatButton} from 'material-ui';

import UpdateStore from '../../../../../../modules/stores/UpdateStore.js';
import Sequencer from '../../../../../../modules/Sequencer/Sequencer.js';

class DynamicControlBar extends React.Component {

  constructor(props) {
  	super(props);
    this.state = {
    	codeParsed: false,
    };
  }

  onPlay = () => {
  	// always update, because React disables
    Sequencer.update();
  }

  onPause() {
    UpdateStore.getLiveOptions().codeRunning = false;
  }

  onAdvance() {
    Sequencer.update(true);
  }

  onReset() {
    UpdateStore.resetState();
    // this.sequencer = null;
  }

  onParse = () => {
    UpdateStore.resetState();
    Sequencer.initialize();
    this.setState({codeParsed: true});
  }

  render = () => {
    return (
      <Toolbar style={{display: 'flex', 'alignItems': 'center', justifyContent: 'space-around'}}>
      	<ToolbarGroup>
          <IconButton disabled={!this.state.codeParsed} onClick={this.onPlay} style={{'zIndex': 10}} tooltip="Play or resume dynamic execution"><i className="material-icons">play_arrow</i></IconButton>
          <IconButton disabled={!this.state.codeParsed} onClick={this.onPause} style={{'zIndex': 10}} tooltip="Pause dynamic execution"><i className="material-icons">pause</i></IconButton>
          <IconButton disabled={!this.state.codeParsed} onClick={this.onAdvance} style={{'zIndex': 10}} tooltip="Advance one step"><i className="material-icons">skip_next</i></IconButton>
          <IconButton disabled={!this.state.codeParsed} onClick={this.onReset} style={{'zIndex': 10}} tooltip="Stop and reset execution to start"><i className="material-icons">replay</i></IconButton>
      	</ToolbarGroup>
      	<ToolbarSeparator style={{'top': 0, 'margin': '0 12px 0 12px'}}/>
      	<ToolbarGroup>
      	  <FlatButton onClick={this.onParse} label="Parse editor code" primary={true} />
        </ToolbarGroup>
      </Toolbar>
    );
  }

}

export default DynamicControlBar;
