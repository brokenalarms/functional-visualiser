//TODO - responsible for layout of windows (multiple vis panes?)

import React from 'react';
import createAst from '../../../modules/astParser/astParser.js';

import CodePane from './CodePane/CodePane.jsx';
import VisPane from './VisPane/Vispane.jsx';

function prepareVisualAst(funcObj) {
  return createAst(funcObj);
}

class ActionPane extends React.Component {

  constructor() {
    super();
  }

  static propTypes = {
    example: React.PropTypes.object,
    currentLine: React.PropTypes.number,
  }

  shouldComponentUpdate = (nextProps) => {
    return nextProps.example && !nextProps.isNavBarShowing;
  }

  render = () => {
    if (this.props.example) {
      //TODO - hardcoded, choose from menu
      const funcMap = prepareVisualAst(this.props.example.functional);
      return (
        <div className="action-pane">
      	<VisPane funcMap={funcMap}
      	dimensions={[640, 480]}/>
      	<CodePane />
      </div>
      );
    }
    return null;
  }
}

export default ActionPane;
