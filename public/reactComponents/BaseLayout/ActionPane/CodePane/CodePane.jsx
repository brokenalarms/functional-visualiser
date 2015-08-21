import React from 'react';
import UpdateStore from '../../../../modules/stores/UpdateStore.js';
let brace = require('brace');
// made my own modifications to this and added to open source on GitHub
import AceEditor from '../../../../modules/vendor/react-ace/index.js';
require('brace/mode/javascript');
require('brace/theme/solarized_dark');

/* Interface between React and Ace Editor:
   subscriptions to codeupdating via the UpdateStore
   change the underlying Ace Editor state directly and 
   so don't trigger React re-rendering */

class CodePane {

  static propTypes = {
    codeString: React.PropTypes.string,
    options: React.PropTypes.object,
  }


  static defaultProps = {
    options: {
      theme: 'solarized_dark',
      mode: 'javascript',
      $blockScrolling: 'infinity',
      height: '800px',
      width: '100%',
      fontSize: 18,
      cursorStart: -1,
    },
  }

  componentDidMount = () => {
    UpdateStore.subscribeListener(this.onUpdate);
  }

  componentWillUnmount() {
    UpdateStore.unsubscribeListener(this.onUpdate);
  }

  onUpdate = () => {
    let range = UpdateStore.getState().range;
    if (range !== null) {
      this.refs.aceEditor.editor.selection.setSelectionRange(range);
    }
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
