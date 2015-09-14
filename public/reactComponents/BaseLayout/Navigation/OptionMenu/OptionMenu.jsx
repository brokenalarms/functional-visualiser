import React from 'react';

import {IconButton, IconMenu, MenuItem, Checkbox, List, Toggle, Slider} from 'material-ui';
import SequencerStore from '../../../../modules/stores/SequencerStore.js';
import Sequencer from '../../../../modules/d3DynamicVisualizer/Sequencer/Sequencer.js';
import RefreshStore from '../../../../modules/stores/RefreshStore.js';
import CodeStatusStore from '../../../../modules/stores/CodeStatusStore.js';

class OptionMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      limitReturnedNodes: SequencerStore.getOptions().limitReturnedNodes,
      maxAllowedReturnNodes: SequencerStore.getOptions().maxAllowedReturnNodes,
      maxAllowedReturnNodesFactor: SequencerStore.getOptions().maxAllowedReturnNodesFactor,
      showDynamic: RefreshStore.getOptions().showDynamic,
      delayVisualizer: SequencerStore.getOptions().delayVisualizer,
      sequencerDelay: SequencerStore.getOptions().sequencerDelay,
      minSequencerDelay: SequencerStore.getOptions().minSequencerDelay,
      delayFactor: SequencerStore.getOptions().delayFactor,
      stopOnNotices: SequencerStore.getOptions().stopOnNotices,
      showFunctionLabels: SequencerStore.getOptions().showFunctionLabels,
      isCodeRunning: CodeStatusStore.isCodeRunning(),
    };
  }

  componentDidMount = () => {
    SequencerStore.subscribeOptionListener(this.onSequencerStoreOptionChange);
    CodeStatusStore.subscribeListener(this.onCodeStatusStoreChange);
    RefreshStore.subscribeListener(this.onRefreshStoreOptionChange);
  }

  componentWillUnmount = () => {
    SequencerStore.unsubscribeOptionListener(this.onSequencerStoreOptionChange);
    RefreshStore.unsubscribeListener(this.onRefreshStoreOptionChange);
    CodeStatusStore.unsubscribeListener(this.onCodeStatusStoreChange);
  }

  setVisualizationType = () => {
    let flag = !this.state.showDynamic;
    RefreshStore.setOptions({
      showDynamic: flag,
    });
    Sequencer.restart();
  }

  setShowFunctionLabels = () => {
    let flag = !this.state.showFunctionLabels;
    SequencerStore.setOptions({
      showFunctionLabels: flag,
    });
  }

  setStopOnNotices = () => {
    let flag = !this.state.stopOnNotices;
    SequencerStore.setOptions({
      stopOnNotices: flag,
    });
  }

  setDelayVisualizer = () => {
    let flag = !this.state.delayVisualizer;
    SequencerStore.setOptions({
      delayVisualizer: flag,
    });
  }


  setLimitReturnedNodes = () => {
    let flag = !this.state.limitReturnedNodes;
    SequencerStore.setOptions({
      limitReturnedNodes: flag,
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


  onSequencerStoreOptionChange = () => {
    this.setState({
      limitReturnedNodes: SequencerStore.getOptions().limitReturnedNodes,
      maxAllowedReturnNodes: SequencerStore.getOptions().maxAllowedReturnNodes,
      maxAllowedReturnNodesFactor: SequencerStore.getOptions().maxAllowedReturnNodesFactor,
      delayVisualizer: SequencerStore.getOptions().delayVisualizer,
      sequencerDelay: SequencerStore.getOptions().sequencerDelay,
      minSequencerDelay: SequencerStore.getOptions().minSequencerDelay,
      delayFactor: SequencerStore.getOptions().delayFactor,
      stopOnNotices: SequencerStore.getOptions().stopOnNotices,
      showFunctionLabels: SequencerStore.getOptions().showFunctionLabels,
    });
  }

  onRefreshStoreOptionChange = () => {
    this.setState({
      showDynamic: RefreshStore.getOptions().showDynamic,
    });
  }

  onCodeStatusStoreChange = () => {
    this.setState({
      codeRunning: CodeStatusStore.isCodeRunning(),
    });
  }

  render = () => {
    return (
      <IconMenu
        closeOnItemTouchTap={false}
        iconButtonElement={<IconButton style={{zIndex: '2', color: '#EBF6F5'}} tooltip="Options">Options<i className="material-icons">expand_more</i>
      </IconButton>}>
        <List subheader="Visualization type" subheaderStyle={{color: 'darkgray', width: '280px'}}>
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
        <Checkbox
        style={{padding: '0 24px 0 24px', margin: '12px 0'}}
          name="showLabelsCheckbox"
          ref="showLabelsCheckbox"
          label="Show function labels"
          labelPosition="left"
          labelStyle={{width: 'calc(100% - 100px)'}}
          checked={this.state.showFunctionLabels}
          onCheck={this.setShowFunctionLabels}/>
        <Checkbox
        style={{padding: '0 24px 0 24px', margin: '12px 0'}}
          name="stopForNoticesCheckbox"
          ref="stopForNoticesCheckbox"
          label="Stop on warnings"
          labelPosition="left"
          labelStyle={{width: 'calc(100% - 100px)'}}
          checked={this.state.stopOnNotices}
          onCheck={this.setStopOnNotices}/>
        <Checkbox style={{padding: '0 24px 0 24px', margin: '12px 0'}}
          name="delayVisualizerCheckbox"
          ref="delayVisualizerCheckbox"
          label="Delay visualizer steps"
          labelPosition="left"
          labelStyle={{width: 'calc(100% - 100px)'}}
          checked={this.state.delayVisualizer}
          onCheck={this.setDelayVisualizer}/>
        <MenuItem index={1} disabled={true} style={{lineHeight: '24px'}}>
          <div style={{paddingLeft: '24px', 'color': this.state.delayVisualizer ? 'white' : 'darkgray'}}>Delay: {Math.round(this.state.sequencerDelay * this.state.delayFactor) + ' ms'}</div>
        <Slider style={{margin: '0 12px 24px 12px', touchAction: 'none', cursor: 'pointer'}}
          disabled={!this.state.delayVisualizer}
          onChange={this.setDelayValue}
          name="sequencerDelay"
          min={0}
          value={this.state.sequencerDelay}
          max={1}/>
        </MenuItem>
        <Checkbox style={{padding: '0 24px 0 24px', margin: '12px 0'}}
          name="limitReturnedNodesCheckbox"
          disabled={this.state.codeRunning}
          label={('Limit visible returned functions')}
          labelPosition="left"
          labelStyle={{width: 'calc(100% - 100px)'}}
          checked={this.state.limitReturnedNodes}
          onCheck={this.setLimitReturnedNodes} />
        <MenuItem index={2} disabled={true} style={{lineHeight: '24px'}}>
        <div style={{paddingLeft: '24px', 'color': (this.state.limitReturnedNodes && !this.state.codeRunning) ? 'white' : 'darkgray'}}>Visible: {((this.state.limitReturnedNodes) ? 
        (Math.round(this.state.maxAllowedReturnNodes * this.state.maxAllowedReturnNodesFactor)) : 'unlimited')}</div>
        <Slider style={{margin: '0 12px 24px 12px', touchAction: 'none', cursor: 'pointer'}}
          disabled={!this.state.limitReturnedNodes || this.state.codeRunning}
          onChange={this.setMaxAllowedReturnNodes}
          name="maxAllowedReturnNodesSlider"
          min={0}
          value={this.state.maxAllowedReturnNodes}
          max={1}/>
        </MenuItem>
      </List>
      </IconMenu>
    );
  }
}

export default OptionMenu;
