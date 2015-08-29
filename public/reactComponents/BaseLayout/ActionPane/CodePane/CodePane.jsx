/* Responsible for re-rendering the editor externally
   if the selectedExample constant changes 
   in the OptionStore.
   The editor can then maintain state internally
   and independently synchronise via the CodeStore. */

import React from 'react';
import Editor from './Editor/Editor.jsx';
import ControlBar from './ControlBar/ControlBar.jsx';

class CodePane {

  static propTypes = {
    staticCodeExample: React.PropTypes.func,
    showDynamic: React.PropTypes.bool,
  }

  render = () => {
    return (
      <div className="flex-code-pane">
        <ControlBar showDynamic={this.props.showDynamic}/>
        <Editor staticCodeExample={this.props.staticCodeExample} />
      </div>
    );
  }

}


export default CodePane;
