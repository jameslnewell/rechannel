import React from 'react';
import {render} from 'react-dom';
import {trigger} from 'redial';
import {Provider} from 'react-redux';
import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import {match, Router, browserHistory} from 'react-router';
import {syncHistoryWithStore, routerReducer, routerMiddleware} from 'react-router-redux';
import cookie from 'component-cookie';

const defaultOptions = {
  reducer: {},
  middleware: [],
  enhancer: [],
  beforeLoad: () => Promise.resolve()
};

/**
 * Render an app on the client
 * @param   {object}          options
 * @param   {Element}         options.routes            Your react-router routes
 * @param   {object}          options.reducer           Your redux reducer
 * @param   {Array<function>} [options.middleware]      Your redux middleware(s)
 * @param   {Array<function>} [options.enhancer]        Your Redux enhancer(s)
 * @param   {HTMLElement}     [options.element]         The HTMLElement which react will render into
 * @returns {function}
 */
export default function(options) {

  let {
    routes, reducer, middleware, enhancer,
    beforeLoad,
    element
  } = {...defaultOptions, ...options};

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

  //create the routes if we've been given a factory function
  if (typeof routes === 'function') {
    routes = routes({getState: store.getState, dispatch: store.dispatch});
  }

  //create the enhanced history
  const history = syncHistoryWithStore(browserHistory, store);

  //when the URL changes
  history.listen(location => {

    //route the URL to a component
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

          //fetch data required by the component
          Promise.resolve()
            .then(() => beforeLoad(locals))
            .then(() => trigger('fetch', renderProps.components, locals))
          ;

        }

      }

    });

  });

  //render the app
  render(
    <Provider store={store}>
      <Router history={history} routes={routes}/>
    </Provider>,
    element
  );

}
