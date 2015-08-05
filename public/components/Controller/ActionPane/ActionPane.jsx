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
    //temp
    return true;

    return !this.props.example && nextProps.example.id ||
      this.props.example.id !== nextProps.example.id;
  }

  render = () => {
    if (this.props.example) {
      const funcMap = prepareVisualAst(this.props.example.imperative);
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
