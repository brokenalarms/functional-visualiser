import React from 'react';

import {IconButton, IconMenu, MenuItem, Checkbox, List, Toggle, Slider} from 'material-ui';


class OptionMenu {

  render() {
    return (
      <IconMenu iconButtonElement={<IconButton iconClick={this.handleRightIconClick} style={{zIndex: '2', color: '#EBF6F5'}} tooltip="Options"><i className="material-icons">expand_more</i></IconButton>}>

      	<List subheader="Visualization type" subheaderStyle={{color: 'darkgray', width: '300px'}}>
      	<MenuItem style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      		<div>static</div>
      		<Toggle
  				name="toggleDynamic"
  				value="toggleDynamic"
  				style={{width: 'auto'}}/>
  			<div>dynamic</div>
  		</MenuItem>
  		</List>
      	<List subheader="Live Options" subheaderStyle={{color: 'darkgray'}}>
      	<MenuItem>Step delay</MenuItem>
      	<Slider style={{margin: '0 24px 24px 24px',touchAction: 'none'}}
      		className="unselectable"
      		name="Delay"
      		min={0.01}
      		defaultValue={0.5}
      		max={1}/>
      	<Checkbox style={{padding: '0 24px 0 24px'}}
  			name="delayVisualizer"
  			value="gap"
  			label="Visualization follows code selection"
  			labelPosition="left"
  			labelStyle={{width: 'calc(100% - 100px)'}}
  			defaultChecked={true}
  			onCheck={this.setDelayVisualizer}/>
  		</List>
      </IconMenu>
    );
  }
}

export default OptionMenu;
