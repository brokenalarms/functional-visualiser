import React from 'react';

import {IconButton, IconMenu, MenuItem, Checkbox, List, Toggle, Slider} from 'material-ui';
import SequencerStore from '../../../../modules/stores/SequencerStore.js';
import Sequencer from '../../../../modules/d3DynamicVisualizer/Sequencer/Sequencer.js';
import RefreshStore from '../../../../modules/stores/RefreshStore.js';

class OptionMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      limitReturnedNodes: SequencerStore.getOptions().limitReturnedNodes,
      maxAllowedReturnNodes: SequencerStore.getOptions().maxAllowedReturnNodes,
      maxAllowedReturnNodesFactor: SequencerStore.getOptions().maxAllowedReturnNodesFactor,
      showDynamic: RefreshStore.getOptions().showDynamic,
      staggerEditorAndVisualizer: SequencerStore.getOptions().staggerEditorAndVisualizer,
      sequencerDelay: SequencerStore.getOptions().sequencerDelay,
      minSequencerDelay: SequencerStore.getOptions().minSequencerDelay,
      delayFactor: SequencerStore.getOptions().delayFactor,
    };
  }

  componentDidMount = () => {
    SequencerStore.subscribeOptionListener(this.onSequencerStoreOptionChange);
    RefreshStore.subscribeListener(this.onRefreshStoreOptionChange);
  }

  componentWillUnmount = () => {
    SequencerStore.unsubscribeOptionListener(this.onSequencerStoreOptionChange);
    RefreshStore.unsubscribeListener(this.onRefreshStoreOptionChange);
  }

  setStaggerEditorAndVisualizer = (event, checked) => {
    SequencerStore.setOptions({
      staggerEditorAndVisualizer: !checked,
    });
  }

  setlimitReturnedNodes = (event, checked) => {
    SequencerStore.setOptions({
      limitReturnedNodes: !checked,
    });
  }

  setMaxAllowedReturnNodes = (e, sliderValue) => {
    SequencerStore.setOptions({
      maxAllowedReturnNodes: sliderValue,
    });
  }
  setDelayValue = (e, sliderValue) => {
    SequencerStore.setOptions({
      sequencerDelay: sliderValue,
    });
  }

  setVisualizationType = (event, checked) => {
    RefreshStore.setOptions({
      showDynamic: !checked,
    });
    Sequencer.restart();
  }

  onSequencerStoreOptionChange = () => {
    this.setState({
      limitReturnedNodes: SequencerStore.getOptions().limitReturnedNodes,
      maxAllowedReturnNodes: SequencerStore.getOptions().maxAllowedReturnNodes,
      maxAllowedReturnNodesFactor: SequencerStore.getOptions().maxAllowedReturnNodesFactor,
      staggerEditorAndVisualizer: SequencerStore.getOptions().staggerEditorAndVisualizer,
      sequencerDelay: SequencerStore.getOptions().sequencerDelay,
      minSequencerDelay: SequencerStore.getOptions().minSequencerDelay,
      delayFactor: SequencerStore.getOptions().delayFactor,
    });
  }

  onRefreshStoreOptionChange = () => {
    this.setState({
      showDynamic: RefreshStore.getOptions().showDynamic,
    });
  }

  render = () => {
    return (
      <IconMenu
        closeOnItemTouchTap={false}
        iconButtonElement={<IconButton style={{zIndex: '2', color: '#EBF6F5'}} tooltip="Options">Options<i className="material-icons">expand_more</i>
      </IconButton>}>
        <List subheader="Visualization type" subheaderStyle={{color: 'darkgray', width: '250px'}}>
        <MenuItem disabled={true} index={0} style={{color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{color: 'white'}}>static (POC)</div>
          <Toggle 
            ref="toggleDynamic"
            onToggle={this.setVisualizationType}
            name="toggleDynamic"
            checked={this.state.showDynamic}
            style={{width: 'auto'}}/>
        <div style={{color: 'white'}}>dynamic</div>
      </MenuItem>
      </List>
        <List subheader="Dynamic visualization options" subheaderStyle={{color: 'darkgray'}}>
        <MenuItem index={1} disabled={true}>
          <div style={{color: 'white'}}>Step delay: {Math.round(this.state.sequencerDelay * this.state.delayFactor) + ' ms'}</div>
        <Slider style={{margin: '0 12px 24px 12px', touchAction: 'none', cursor: 'pointer'}}
          onChange={this.setDelayValue}
          name="sequencerDelay"
          min={this.state.minSequencerDelay}
          defaultValue={SequencerStore.getOptions().sequencerDelay}
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
        <Checkbox style={{padding: '0 24px 0 24px', marginTop: '12px'}}
        name="limitReturnedNodes"
        label={('Limit visible returned functions')}
        labelPosition="left"
        labelStyle={{width: 'calc(100% - 100px)'}}
        defaultChecked={this.state.limitReturnedNodes}
        checked={this.state.limitReturnedNodes}
        onCheck={this.setlimitReturnedNodes} />
        <MenuItem index={2} disabled={true}>
        <div style={!this.state.limitReturnedNodes ? {'color': 'darkgray'} : {'color': 'white'}}>Max visible: {((this.state.limitReturnedNodes) ? 
        (Math.round(this.state.maxAllowedReturnNodes * this.state.maxAllowedReturnNodesFactor)) : 'unlimited')}</div>
        <Slider style={{margin: '0 12px 24px 12px', touchAction: 'none', cursor: 'pointer'}}
          disabled={!this.state.limitReturnedNodes}
          onChange={this.setMaxAllowedReturnNodes}
          name="maxAllowedReturnNodesSlider"
          min={0}
          defaultValue={SequencerStore.getOptions().maxAllowedReturnNodes}
          value={this.state.maxAllowedReturnNodes}
          max={1}/>
        </MenuItem>
      </List>
      </IconMenu>
    );
  }
}

export default OptionMenu;
