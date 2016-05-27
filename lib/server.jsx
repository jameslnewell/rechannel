import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Provider} from 'react-redux';
import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import {match, RouterContext} from 'react-router';
import {routerReducer} from 'react-router-redux';
import {trigger} from 'redial';
import createHtml from './createHtml';

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
 * @param   {Component}       [options.html]            Your root HTML component
 * @param   {function}        [options.send]            A function
 * @returns {function}
 */
export default function(options) {

  const {
    routes, reducer, middleware, enhancer,
    $init, $load,
    html, send
  } = {...defaultOptions, ...options};

  const Component = html || createHtml();

  return (req, res, next) => {

    //create the store
    const store = createStore(
      combineReducers({
        ...reducer,
        routing: routerReducer
      }),
      undefined, //eslint-disable-line
      compose(
        applyMiddleware(...middleware),
        ...enhancer
      )
    );

    const cookies = req.cookies || {};

    Promise.resolve($init({getState: store.getState, dispatch: store.dispatch, cookies}))
      .then(() => {

        //create the routes if we've been given a factory function
        let routesForRequest = routes;
        if (typeof routes === 'function') {
          routesForRequest = routes({getState: store.getState, dispatch: store.dispatch, cookies});
        }

        //route the URL to a component
        match({routesForRequest, location: req.url}, (routeError, redirectLocation, renderProps) => {

          const render = () => {

            const locals = {

              dispatch: store.dispatch,
              getState: store.getState,

              location: renderProps.location,
              params: renderProps.params,

              cookies

            };

            //fetch data required by the component
            Promise.resolve()
              .then(() => trigger('fetch', renderProps.components, locals))
              .then(() => $load(locals))
              .then(() => {

                //render the app
                const elements = (
                  <Component state={store.getState()}>
                    <Provider store={store}>
                      <RouterContext {...renderProps} />
                    </Provider>
                  </Component>
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
