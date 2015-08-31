import React from 'react';

import {IconButton, IconMenu, MenuItem, Checkbox, List, ListItem, Toggle, Slider} from 'material-ui';
import SequencerStore from '../../../../modules/stores/SequencerStore.js';
import Sequencer from '../../../../modules/Sequencer/Sequencer.js';
import RefreshStore from '../../../../modules/stores/RefreshStore.js';

class OptionMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showDynamic: RefreshStore.getOptions().showDynamic,
      staggerEditorAndVisualizer: SequencerStore.getDelayOptions().staggerEditorAndVisualizer,
      sequencerDelay: SequencerStore.getDelayOptions().sequencerDelay,
      delayFactor: SequencerStore.getDelayOptions().delayFactor,
    };
  }

  setStaggerEditorAndVisualizer = (event, checked) => {
    SequencerStore.setDelayOptions({
      staggerEditorAndVisualizer: !checked,
    });
    this.setState({
      staggerEditorAndVisualizer: !checked,
    });
  }

  setDelayValue = (e, sliderValue) => {
    SequencerStore.setDelayOptions({
      sequencerDelay: sliderValue,
    });
    this.setState({
      sequencerDelay: sliderValue,
    });
  }

  setVisualizationType = (event, checked) => {
    RefreshStore.setOptions({
      showDynamic: !checked,
    });
    Sequencer.restart();
    this.setState({
      showDynamic: !checked,
    });
  }

  render = () => {
    return (
      <IconMenu iconButtonElement={<IconButton iconClick={this.handleRightIconClick} style={{zIndex: '2', color: '#EBF6F5'}} tooltip="Options">Options<i className="material-icons">expand_more</i></IconButton>}>
        <List subheader="Visualization type" subheaderStyle={{color: 'darkgray', width: '250px'}}>
        <MenuItem index={0} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>static</div>
          <Toggle
            ref="toggleDynamic"
            onToggle={this.setVisualizationType}
            name="toggleDynamic"
            checked={this.state.showDynamic}
            style={{width: 'auto'}}/>
        <div>dynamic</div>
      </MenuItem>
      </List>
        <List subheader="Dynamic visualization options" subheaderStyle={{color: 'darkgray'}}>
        <MenuItem index={1}>
          <div>Step delay: {Math.round(this.state.sequencerDelay * this.state.delayFactor) + ' ms'}</div>
        <Slider style={{margin: '0 24px 24px 24px', touchAction: 'none', cursor: 'pointer'}}
          onChange={this.setDelayValue}
          name="sequencerDelay"
          min={0.00333}
          defaultValue={this.state.sequencerDelay}
          value={this.state.sequencerDelay}
          max={1}/>
          </MenuItem>
        <Checkbox style={{padding: '0 24px 0 24px'}}
        name="delayVisualizer"
        label="Stagger code and visualizer steps"
        labelPosition="left"
        labelStyle={{width: 'calc(100% - 100px)'}}
        defaultChecked={this.state.staggerEditorAndVisualizer}
        checked={this.state.staggerEditorAndVisualizer}
        onCheck={this.setStaggerEditorAndVisualizer}/>
      </List>
      </IconMenu>
    );
  }
}

export default OptionMenu;
