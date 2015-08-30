/* Responsible for re-rendering the editor externally
   if the selectedExample constant changes 
   in the RefreshStore.
   The editor can then maintain state internally
   and independently synchronise via the CodeStore. */

import React from 'react';

import Editor from './Editor/Editor.jsx';
import ControlBar from './ControlBar/ControlBar.jsx';

import CodeStatusStore from '../../../../modules/stores/CodeStatusStore.js';


class CodePane extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      codeRunning: CodeStatusStore.isCodeRunning(),
      codeParsed: CodeStatusStore.isCodeParsed(),
    };
  }

  static propTypes = {
    codeString: React.PropTypes.string.isRequired,
    showDynamic: React.PropTypes.bool.isRequired,
  }

  componentDidMount = () => {
    CodeStatusStore.subscribeListener(this.onCodeStatusChange);
  }

  componentWillReceiveProps = (nextProps) => {
    if ((nextProps.showDynamic !== this.props.showDynamic)) {
      CodeStatusStore.setCodeParsed(false);
    }
  }

  componentWillUnmount = () => {
    CodeStatusStore.unsubscribeListener(this.onCodeStatusChange);
  }

  onCodeStatusChange = (newStatus) => {
    // don't wait for the sequencer, it doesn't update
    // needlessly if only advancing a single step.
    // and even if it did, if the delay is set to high
    // we would still want to
    // give the user control again immediately.
    this.setState({
      codeRunning: newStatus.codeRunning,
      codeParsed: newStatus.codeParsed,
    });
  }

  render = () => {
    let isCodePresent = Boolean(this.props.codeString);
    return (
      <div className="flex-code-pane">
        <ControlBar showDynamic={this.props.showDynamic}
          codeRunning={this.state.codeRunning}
          codeParsed={this.state.codeParsed}
          isCodePresent={isCodePresent}/>
        <Editor codeRunning={this.state.codeRunning}
        codeString={this.props.codeString}
        onUserChangeCode={CodeStatusStore.setCodeParsed.bind(this, false)}/>
      </div>
    );
  }

}

export default CodePane;
