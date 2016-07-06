import React from 'react';
import {IndexRoute, Route} from 'react-router';

import App from './components/App';
import Page1 from './components/Page1';
import Page2 from './components/Page2';
import Counter from './components/Counter';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Counter}/>
    <Route path="page-1" component={Page1}/>
    <Route path="page-2" component={Page2}/>
  </Route>
);
