import React from 'react';
import Editor from './Editor/Editor.jsx';
import ControlBar from './ControlBar/ControlBar.jsx';
class CodePane {

  static propTypes = {
    codeString: React.PropTypes.string,
    visualizerType: React.PropTypes.string,
  }

  render = () => {
    return (
      <div className="flex-code-pane">
        <ControlBar visualizationType={this.props.visualizationType}/>
        <Editor codeString={this.props.codeString} />
      </div>
    );
  }

}


export default CodePane;
