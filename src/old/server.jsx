import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Provider} from 'react-redux';
import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import {match, RouterContext} from 'react-router';
import {routerReducer} from 'react-router-redux';
import {trigger} from 'redial';
import createHtml from '../createHtml';

const isDevMode = process.env.NODE_ENV !== 'production';

const defaultOptions = {
  reducer: {},
  middleware: [],
  enhancer: [],
  $init: () => Promise.resolve(),
  $load: () => Promise.resolve()
};

/**
 *
 * @param   {object}          options
 * @param   {function}        options.routes            Your react-router routes
 * @param   {object}          options.reducer           Your redux reducer
 * @param   {Array<function>} [options.middleware]      Your redux middleware(s)
 * @param   {Array<function>} [options.enhancer]        Your Redux enhancer(s)
 * @param   {History}         [options.history]         Your react-router history instance
 * @param   {Component}       [options.html]            Your root HTML component
 * @param   {function}        [options.send]            A function
 * @returns {function}
 */
export default function(options) {

  const {
    routes, reducer, middleware, enhancer, history,
    $init, $load,
    html, send
  } = {...defaultOptions, ...options};

  const Html = html || createHtml();

  //validate options
  if (isDevMode) {
    if (typeof reducer !== 'object') {
      throw new Error('Your `reducer` must be an object passable to `combineReducers`.');
    }
  }

  //add middleware to freeze the redux state
  const allTheMiddleware = [...middleware];
  if (isDevMode) {
    allTheMiddleware.push(require('redux-immutable-state-invariant')())
  }

  return (req, res, next) => {

    //create the store
    const store = createStore(
      combineReducers({
        ...reducer,
        routing: routerReducer
      }),
      undefined, //eslint-disable-line
      compose(
        applyMiddleware(...allTheMiddleware),
        ...enhancer
      )
    );

    const context = {
      headers: req.headers || {},
      cookies: req.cookies || {},
      query: req.query || {}
    };

    Promise.resolve($init({getState: store.getState, dispatch: store.dispatch, ...context}))
      .then(() => {

        //create the routes if we've been given a factory function
        let routesForRequest = routes;
        if (typeof routes === 'function') {
          routesForRequest = routes({getState: store.getState, dispatch: store.dispatch, ...context});
        }

        //route the URL to a component
        match({routes: routesForRequest, location: req.url, history}, (routeError, redirectLocation, renderProps) => {

          const render = () => {

            const locals = {

              dispatch: store.dispatch,
              getState: store.getState,

              location: renderProps.location,
              params: renderProps.params,

              ...context

            };

            //fetch data required by the component
            Promise.resolve()
              .then(() => trigger('fetch', renderProps.components, locals))
              .then(() => $load(locals))
              .then(() => {

                //render the app
                const elements = (
                  <Html {...context} state={store.getState()}>
                    <Provider store={store}>
                      <RouterContext {...renderProps} />
                    </Provider>
                  </Html>
                );

                //render the layout
                let htmlForResponse = '';
                try {
                  htmlForResponse = `<!doctype html>${renderToStaticMarkup(elements)}`;
                } catch (renderError) {
                  return next(renderError);
                }

                //send the response
                if (send) {
                  send(res, htmlForResponse);
                } else {
                  res.send(htmlForResponse);
                }

              })
              .catch(next)
            ;

          };

          if (routeError) {                 //500 - an error ocurred during routing
            return next(routeError);
          } else if (redirectLocation) {    //302 - routing matched the URL to a redirect
            return res
              .redirect(302, `${redirectLocation.pathname}${redirectLocation.search}`)
            ;
          } else if (renderProps) {         //200 - routing matched the URL to a component
            render();
          } else {                          //404 - routing could not match a URL to a component
            return next();
          }

        });

      })
      .catch(next)
    ;

  };
}

export {createHtml};
