import React from 'react';

import D3Root from './D3Root/D3Root.jsx';
import CodePane from './CodePane/CodePane.jsx';


class ActionPane {

  render() {
    return (
      <div>
      	<D3Root />
      	<CodePane />
      </div>
    );
  }

}

export default ActionPane;