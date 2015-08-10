// TODO - responsible for layout of windows (multiple vis panes?)

import React from 'react';

/* massaged data created in here from AST and passed to
   D3 components as props - they just render based on info
   received and don't care how it was produced */
import getVisPaneNodes from '../../../modules/astParser/astParser.js';

import CodePane from './CodePane/CodePane.jsx';
import VisPane from './VisPane/Vispane.jsx';

class ActionPane extends React.Component {

  constructor() {
    super();
  }

  static propTypes = {
    example: React.PropTypes.func,
    currentLine: React.PropTypes.number,
  }

  shouldComponentUpdate = (nextProps) => {
    return nextProps.example && !nextProps.isNavBarShowing;
  }

  render = () => {
    if (this.props.example) {
      let exampleString = this.props.example.toString();
      const [nodes, links] = getVisPaneNodes(exampleString);
      return (
        <div className="flex-action-pane">
        <VisPane
          nodes={nodes}
          links={links}
          dimensions={[1000, 800]}/>
        <CodePane
          codeString={exampleString} />
      </div>
      );
    }
    return null;
  }
}

export default ActionPane;
