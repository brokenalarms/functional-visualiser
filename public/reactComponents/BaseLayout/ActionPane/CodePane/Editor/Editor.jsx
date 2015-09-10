import React from 'react';
import AceEditor from '../../../../../modules/vendor_mod/react-ace/index.js';
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
    this.refs.aceEditor.editor.session.setUseWrapMode(true);
  }

  shouldComponentUpdate = () => {
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
         look as exact. Still starts looking from the actual character the 
         range is on anyway, so should find immediately. */
      let range = editor.find(execCodeBlock, {
        start: SequencerStore.getCurrentRange().start,
      });
      if (!range) {
        /* backup selection by node LOC, due to escodegen
           ocassionally not rebuilding the exact same code string 
           from a single node versus the whole progam */
        range = SequencerStore.getCurrentRange().collapseRows();
      }
      this.setRange(editor, range);
    }
  }

  onChangeCodeInEditor = (newValue, isPaste) => {
    /* The Sequencer always checks the CodeStore preferentially to 
       the RefreshStore for user-modified code that has overwritten
       the selectedExample.*/
    let editor = this.refs.aceEditor.editor;
    // don't trigger change for programmatic events (adding IIFE info)
    // as this will clear the state of the DynamicControlBar
    if ((editor.curOp && editor.curOp.command.name) ||
      isPaste) {
      CodeStore.set(newValue, true);
      this.props.onUserChangeCode();
    }
  }

  onPaste = () => {
    this.onChangeCodeInEditor(this.refs.aceEditor.editor.getValue(), true);
  }

  onCodeStoreChange = (userUpdate) => {
    if (!userUpdate) {
      let editor = this.refs.aceEditor.editor;
      editor.setValue(CodeStore.get());
      editor.selection.clearSelection();
      // prettify
      editor.setValue(editor.getValue());
      //editor.session.setUseSoftTabs()
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
        onPaste={this.onPaste}
        {...other}/>
      </div>
    );
  }

}

export default Editor;
