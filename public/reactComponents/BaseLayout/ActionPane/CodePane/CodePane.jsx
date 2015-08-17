import React from 'react';

let brace = require('brace');
  // made my own modifications to this and submitted PR
import AceEditor from '../../../../modules/vendor/react-ace/index.js';
require('brace/mode/javascript');
require('brace/theme/solarized_dark');
//require('brace/range').Range;

// Interface between React and CodeMirror

/* TODO: codePane and d3Visualizer are going to subscribe to the same store
   so that d3Visualizer can update independent of React, but this doesn't */

class CodePane {

  static propTypes = {
    codeString: React.PropTypes.string,
    options: React.PropTypes.object,
  }


  static defaultProps = {
    options: {
      theme: 'solarized_dark',
      $blockScrolling: 'infinity',
      height: '800px',
      width: '100%',
      fontSize: 18,
      cursorStart: 1,
    },
  }

  componentDidMount = () => {
  //  let selection = new Range(1, 1, 3, 4);
 //   this.refs.aceEditor.editor.selection.setSelectionRange(selection);
  }

  render() {
    let {...other
    } = this.props.options;
    return (
      <div className="flex-code-pane">
        <AceEditor ref={'aceEditor'}
        name="aceEditor"
          value={this.props.codeString}
          {...other} />
      </div>
    );
  }
}


export default CodePane;
