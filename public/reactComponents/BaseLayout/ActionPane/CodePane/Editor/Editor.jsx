import React from 'react';
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

class Editor {

  static propTypes = {
    options: React.PropTypes.object,
    codeRunning: React.PropTypes.bool,
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
    SequencerStore.subscribeEditor(this.onSequencerAction);
    CodeStore.subscribeListener(this.onCodeStoreChange);
  }

  shouldComponentUpdate = (nextProps) => {
    return false;
  }

  componentWillReceiveProps = (nextProps) => {
    this.refs.aceEditor.editor.setReadOnly(nextProps.codeRunning);
  }

  componentDidUpdate = () => {}

  setRange = (editor, range) => {
    if (range) {
      editor.selection.setSelectionRange(range);
    } else {
      editor.selection.clearSelection();
    }
  }

  componentWillUnmount = () => {
    SequencerStore.unsubscribeEditor(this.onSequencerAction);
    CodeStore.unsubscribeListener(this.onCodeStoreChange);
  }

  onSequencerAction = () => {
    // highlight actioned code in the editor on each Sequencer update.
    let editor = this.refs.aceEditor.editor;
    if (this.props.codeRunning) {
      // action happened, disable editing and select range result
      let execCodeBlock = SequencerStore.getCurrentCodeBlock();
      /* try to find via find (regex) first, since the way AceEditor displays
         tabs means that range selections include the preceding tab so don't 
         look as exact. */
      let range = editor.find(execCodeBlock);
      if (!range) {
        /* backup selection by node LOC, due to escodegen
           ocassionally not rebuilding the exact same code string 
           from a single node versus the whole progam */
        range = SequencerStore.getCurrentRange().collapseRows();
      }
      this.setRange(editor, range);
    }
  }

  onChangeCodeInEditor = (newValue) => {
    /* The Sequencer always checks the CodeStore preferentially to 
       the RefreshStore for user-modified code that has overwritten
       the selectedExample.*/
    let editor = this.refs.aceEditor.editor;
    // don't trigger change for programmatic events (adding IIFE info)
    // as this will clear the state of the DynamicControlBar
    if (editor.curOp && editor.curOp.command.name) {
      CodeStore.set(newValue, true);
      this.props.onUserChangeCode();
    }
  }

  onCodeStoreChange = (userUpdate) => {
    if (!userUpdate) {
      this.refs.aceEditor.editor.setValue(CodeStore.get());
    }
  }

  render = () => {
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
