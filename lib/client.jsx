import React from 'react';
import {render} from 'react-dom';
import {trigger} from 'redial';
import {Provider} from 'react-redux';
import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import {match, Router, browserHistory} from 'react-router';
import {syncHistoryWithStore, routerReducer, routerMiddleware} from 'react-router-redux';
import cookie from 'component-cookie';

/**
 * Render an app on the client
 * @param   {object}          options
 * @param   {function}        options.routes            Your react-router routes
 * @param   {object}          options.reducer           Your redux reducer
 * @param   {Array<function>} [options.middleware]      Your redux middleware(s)
 * @param   {Array<function>} [options.enhancer]        Your Redux enhancer(s)
 * @param   {function}        [options.element]         The HTMLElement which react will render into
 * @returns {function}
 */
export default function(options) {
  let {routes, reducer, middleware, enhancer, element} = options;

  reducer = reducer || {};
  middleware = middleware || [];
  enhancer = enhancer || [];
  element = element || document.querySelector('#app');

  //create the store
  const store = createStore(
    combineReducers({
      ...reducer,
      routing: routerReducer
    }),
    window.__INITIAL_STATE__,
    compose(
      applyMiddleware(...middleware, routerMiddleware(browserHistory)),
      ...enhancer,
      typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
        ? window.devToolsExtension()
        : f => f
    )
  );

  //create the enhanced history
  const history = syncHistoryWithStore(browserHistory, store);

  history.listen(location => {

    match({routes, location}, (routeError, redirectLocation, renderProps) => {

      if (window.__INITIAL_STATE__) {     //the current page was rendered by the server, we don't need to fetch
        delete window.__INITIAL_STATE__;
      } else {                    //the current page was navigated to on the client, we need to fetch

        if (renderProps) {

          const locals = {

            dispatch: store.dispatch,
            getState: store.getState,

            location: renderProps.location,
            params: renderProps.params,

            cookies: cookie()

          };

          trigger('fetch', renderProps.components, locals);

        }

      }

    });

  });

  render(
    <Provider store={store}>
      <Router history={history} routes={routes}/>
    </Provider>,
    element
  );

}
