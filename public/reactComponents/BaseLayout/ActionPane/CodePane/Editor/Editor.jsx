import React from 'react';
import {throttle} from 'lodash';

import AceEditor from 'react-ace';
let brace = require('brace');
require('brace/mode/javascript');
require('brace/theme/solarized_dark');

/* Interface between React and Ace Editor:
   React may pass in staticCodeExample and cause component
   to re-render entirely, but the
   subscriptions to code updating via the CodeStore/SequencerStore
   change the underlying Ace Editor state directly and 
   so don't trigger React re-rendering */
import SequencerStore from '../../../../../modules/stores/SequencerStore.js';
import CodeStore from '../../../../../modules/stores/CodeStore.js';
import LiveOptionStore from '../../../../../modules/stores/LiveOptionStore.js';

class Editor {

  static propTypes = {
    staticCodeExample: React.PropTypes.func,
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
    SequencerStore.subscribeListener(this.onSequencerActionUpdate);
    LiveOptionStore.subscribeListener(this.onPlayPauseUpdate);
  }

  componentWillUnmount() {
    SequencerStore.unsubscribeListener(this.onSequencerActionUpdate);
    LiveOptionStore.unsubscribeListener(this.onPlayPauseUpdate);
  }

  onSequencerActionUpdate = () => {
    // action happened, disable editing and select range result
    if (LiveOptionStore.isCodeRunning()) {
      let editor = this.refs.aceEditor.editor;
      editor.setReadOnly(true);
      let execCodeBlock = SequencerStore.getState().execCodeBlock;
      let range = editor.find(execCodeBlock);
      if (!range) {
        /* backup selection due to potential of escodegen not rebuilding
           the exact same code string: selects whole row only.
           (loc selection info in node doesn't work due to indenting
            in editor) */
        range = SequencerStore.getState().range.collapseRows();
      }
      editor.selection.setSelectionRange(range);
    }
  }

  onPlayPauseUpdate = () => {
    let editor = this.refs.aceEditor.editor;
    if (!LiveOptionStore.isCodeRunning()) {
      // we have finished, need to allow editing again
      editor.setReadOnly(false);
      editor.selection.clearSelection();
      editor.moveCursorTo(0, 0);
    }
  }

  onChangeCodeInEditor = () => {
    /* The Sequencer always checks the CodeStore preferentially to 
       the OptionStore for user-modified code that has overwritten
       the selectedExample.*/
    if (this.refs && this.refs.aceEditor) {
      CodeStore.set(this.refs.aceEditor.editor.getValue());
    }
  }


  render = () => {
    let {...other
    } = this.props.options;
    return (
      <div>
        <AceEditor ref="aceEditor"
        value = {this.props.staticCodeExample.toString()}
        onChange={this.onChangeCodeInEditor}
        {...other}/>
      </div>
    );
  }

}


export default Editor;
