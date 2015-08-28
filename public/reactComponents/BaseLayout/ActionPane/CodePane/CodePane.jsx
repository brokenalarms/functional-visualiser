/* Responsible for re-rendering the editor externally
   if the selectedExample constant changes 
   in the OptionStore.
   The editor can then maintain state internally
   and independently synchronise via the CodeStore. */

import React from 'react';
import Editor from './Editor/Editor.jsx';
import DynamicControlBar from './ControlBar/DynamicControlBar/DynamicControlBar.jsx';

class CodePane {

  static propTypes = {
    staticCodeExample: React.PropTypes.func,
    showDynamic: React.PropTypes.bool,
  }

/*  shouldComponentUpdate = (nextProps) => {
    return (this.props.staticCodeExample !== nextProps.staticCodeExample ||
      this.props.showDynamic !== nextProps.showDynamic);
  }
*/
  render = () => {
    let controlBar = (this.props.showDynamic) ?
      <DynamicControlBar /> :
      null;

    return (
      <div className="flex-code-pane">
        {controlBar}
        <Editor staticCodeExample={this.props.staticCodeExample} />
      </div>
    );
  }

}


export default CodePane;
