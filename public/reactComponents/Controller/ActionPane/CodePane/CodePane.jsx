import React from 'react';
import CodeMirror from 'react-codemirror';

// Interface between React and CodeMirror

/* TODO: codePane and d3Visualizer are going to subscribe to the same store
   so that d3Visualizer can update independent of React, but this doesn't */

class CodePane {

  static propTypes = {
    codeString: React.PropTypes.string,
  }

  static defaultProps = {
    codeMirrorOptions: {
      theme: 'solarized dark',
      lineNumbers: true,
      styleActiveLine: true,
      readOnly: false,
    },
  }

  render() {
    let {...other} = this.props.codeMirrorOptions;
    return (
      <div className="flex-code-pane">
        <CodeMirror ref={'CodeMirror'}
          value={this.props.codeString}
  		  options={this.props.codeMirrorOptions} />
  	  </div>
    );
  }
}


export default CodePane;
