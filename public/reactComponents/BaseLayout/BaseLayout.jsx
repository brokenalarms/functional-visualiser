/*
  Navigation split and receives subscriptions seperately
  so as to not trigger re-render of ActionPane on
  Navbar / Modal show/hide.
*/

import React from 'react';
import Navigation from './Navigation/Navigation.jsx';
import ActionPane from './ActionPane/ActionPane.jsx';


class BaseLayout {

  render() {
    return (
      <div>
          <Navigation />
          <ActionPane/>
       </div>
    );
  }
}

export default BaseLayout;
