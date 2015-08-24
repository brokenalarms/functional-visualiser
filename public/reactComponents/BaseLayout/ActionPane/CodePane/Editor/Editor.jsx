import React from 'react';
import SequencerStore from '../../../../../modules/stores/SequencerStore.js';
import CodeStore from '../../../../../modules/stores/CodeStore.js';
import {throttle} from 'lodash';

// made my own modifications to this and added to open source on GitHub
import AceEditor from '../../../../../modules/vendor/react-ace/index.js';
let brace = require('brace');
require('brace/mode/javascript');
require('brace/theme/solarized_dark');


/* Interface between React and Ace Editor:
   subscriptions to codeupdating via the SequencerStore
   change the underlying Ace Editor state directly and 
   so don't trigger React re-rendering */

class Editor {

  static propTypes = {
    codeString: React.PropTypes.string,
    options: React.PropTypes.object,
  }


  static defaultProps = {
    options: {
      theme: 'solarized_dark',
      mode: 'javascript',
      height: '800px',
      width: '100%',
      fontSize: 18,
      cursorStart: 1,
      editorProps: {
        $blockScrolling: Infinity,
        readOnly: false,
      },
    },
  }

  componentDidMount = () => {
    SequencerStore.subscribeListener(this.onUpdate);
  }

  componentWillUnmount() {
    SequencerStore.unsubscribeListener(this.onUpdate);
  }

  onUpdate = () => {
    let editor = this.refs.aceEditor.editor;
    if (SequencerStore.getState().codeRunning) {
      editor.setReadOnly(true);
      let execCode = SequencerStore.getState().execCode;
      if (execCode && editor.getValue() !== execCode) {
        editor.setValue(execCode, 1);
      }
      let execCodeLine = SequencerStore.getState().execCodeLine;
      let range = editor.find(execCodeLine);
      if (!range) {
        /* backup selection due to potential of escodegen not rebuilding
           the exact same code string: selects whole row only.
           (loc selection info in node doesn't work due to indenting
            in editor) */
        range = SequencerStore.getState().range.collapseRows();
      }
      editor.selection.setSelectionRange(range);
    } else {
      // we have finished, need to allow editing again
      editor.setReadOnly(false);
      editor.selection.clearSelection();
      editor.moveCursorTo(0, 0);
    }
  }

  onChangeCodeInEditor = () => {
    if (this.refs && this.refs.aceEditor) {
        CodeStore.set(this.refs.aceEditor.editor.getValue());
    }
  }


  render() {
    let {...other
    } = this.props.options;
    return (
      <div>
        <AceEditor ref="aceEditor"
        value = {this.props.codeString}
        onChange={this.onChangeCodeInEditor}
        {...other}/>
      </div>
    );
  }

}


export default Editor;
