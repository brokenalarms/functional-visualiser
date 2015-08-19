'use strict';
/* Single declaration point to instantiate React app
   and ensure that the React library is only imported
   as a single instance and then re-used by child components.
 */

import React from 'react';
import App from './reactComponents/App.jsx';

React.render(<App />, document.getElementById('root'));