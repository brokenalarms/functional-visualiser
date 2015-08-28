import React from 'react';

import {IconButton, IconMenu, MenuItem, Checkbox, List, Toggle, Slider} from 'material-ui';
import SequencerStore from '../../../modules/stores/SequencerStore.js';
import OptionStore from '../../../modules/stores/OptionStore.js';

class OptionMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showDynamic: OptionStore.getOptions().showDynamic,
      staggerEditorAndVisualizer: SequencerStore.getDelayOptions().staggerEditorAndVisualizer,
      sequencerDelay: SequencerStore.getDelayOptions().sequencerDelay / 3000,
    };
  }

  setEditorVisualizerGap = (event, checked) => {
    SequencerStore.setDelayOptions({
      staggerEditorAndVisualizer: !checked,
    });
    this.setState({
      staggerEditorAndVisualizer: !checked,
    });
  }

  setDelayValue = (e, sliderValue) => {
    let sequencerDelay = sliderValue * 3000;
    SequencerStore.setDelayOptions({
      sequencerDelay,
    });
    this.setState({
      sequencerDelay: sliderValue,
    });
  }

  setVisualizationType = (event, checked) => {
    OptionStore.setOptions({
      showDynamic: !checked,
    });
    this.setState({
      showDynamic: !checked,
    });
  }

  render = () => {
    return null
    return (
      <IconMenu iconButtonElement={<IconButton iconClick={this.handleRightIconClick} style={{zIndex: '2', color: '#EBF6F5'}} tooltip="Options"><i className="material-icons">expand_more</i></IconButton>}>
        <List subheader="Visualization type" subheaderStyle={{color: 'darkgray', width: '300px'}}>
        <MenuItem style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
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
        <List subheader="Live Options" subheaderStyle={{color: 'darkgray'}}>
        <MenuItem>Step Delay</MenuItem>
        <Slider style={{margin: '0 24px 24px 24px', touchAction: 'none'}}
          className="unselectable"
          onChange={this.setDelayValue}
          name="sequencerDelay"
          min={0.01}
          defaultValue={this.state.sequencerDelay}
          value={this.state.sequencerDelay}
          max={1}/>
        <Checkbox style={{padding: '0 24px 0 24px'}}
        name="delayVisualizer"
        label="Stagger code and visualizer steps"
        labelPosition="left"
        labelStyle={{width: 'calc(100% - 100px)'}}
        defaultChecked={true}
        value={this.state.staggerEditorAndVisualizer}
        onCheck={this.setEditorVisualizerGap}/>
      </List>
      </IconMenu>
    );
  }
}

export default OptionMenu;
