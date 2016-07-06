import React from 'react';
import {render} from 'react-dom';
import {trigger} from 'redial';
import {Provider} from 'react-redux';
import {createHistory} from 'history';
import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import {match, Router, useRouterHistory, browserHistory} from 'react-router';
import {syncHistoryWithStore, routerReducer, routerMiddleware} from 'react-router-redux';
import cookie from 'component-cookie';
import qs from 'query-string';

const isDevMode = process.env.NODE_ENV !== 'production';

const defaultOptions = {
  reducer: {},
  middleware: [],
  enhancer: [],
  $init: () => Promise.resolve(),
  $load: () => Promise.resolve()
};

/**
 * Render an app on the client
 * @param   {object}          options
 * @param   {Element}         options.routes            Your react-router routes
 * @param   {object}          options.reducer           Your redux reducer
 * @param   {Array<function>} [options.middleware]      Your redux middleware(s)
 * @param   {Array<function>} [options.enhancer]        Your Redux enhancer(s)
 * @param   {History}         [options.history]         Your react-router history instance
 * @param   {HTMLElement}     [options.element]         The HTMLElement which react will render into
 * @returns {function}
 */
export default function(options) {

  let {
    routes, reducer, middleware, enhancer, history,
    $init, $load,
    element
  } = {...defaultOptions, ...options};

  //get the app element to render into
  element = element || document.querySelector('#app');

  //validate options
  if (isDevMode) {
    if (typeof reducer !== 'object') {
      throw new Error('Your `reducer` must be an object passable to `combineReducers`.');
    }
  }

  //use the browser history if the user hasn't specified one
  if (!history) {
    history = browserHistory;
  }

  //add middleware to freeze the redux state
  const allTheMiddleware = [...middleware, routerMiddleware(history)];
  if (isDevMode) {
    allTheMiddleware.unshift(require('redux-immutable-state-invariant')())
  }

  //create the store
  const store = createStore(
    combineReducers({
      ...reducer,
      routing: routerReducer
    }),
    window.__INITIAL_STATE__,
    compose(
      applyMiddleware(...allTheMiddleware),
      ...enhancer,
      typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
        ? window.devToolsExtension()
        : f => f
    )
  );

  const cookies = cookie();
  const query = qs.parse(window.location.search);

  Promise.resolve($init({getState: store.getState, dispatch: store.dispatch, cookies, query}))
    .then(() => {

      //create the routes if we've been given a factory function
      if (typeof routes === 'function') {
        routes = routes({getState: store.getState, dispatch: store.dispatch, cookies, query});
      }

      //create the enhanced history
      const enhancedHistory = syncHistoryWithStore(history, store);

      //when the URL changes
      enhancedHistory.listen(location => {

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

                cookies,
                query

              };

              //fetch data required by the component
              Promise.resolve()
                .then(() => trigger('fetch', renderProps.components, locals))
                .then(() => $load(locals))
              ;

            }

          }

        });

      });

      //render the app
      render(
        <Provider store={store}>
          <Router history={enhancedHistory} routes={routes}/>
        </Provider>,
        element
      );

    })
    .catch(err => console.error(err))
  ;

}
