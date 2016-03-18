import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Provider} from 'react-redux';
import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import {match, RouterContext} from 'react-router';
import {routerReducer} from 'react-router-redux';
import {trigger} from 'redial';
import createHtml from './createHtml';

export {createHtml};

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
  let {routes, reducer, middleware, enhancer, html, send} = options;

  reducer = reducer || {};
  middleware = middleware || [];
  enhancer = enhancer || [];
  const Component = html || createHtml();

  return (req, res, next) => {

    match({routes, location: req.url}, (routeError, redirectLocation, renderProps) => {

      const render = () => {

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

        const locals = {

          dispatch: store.dispatch,
          getState: store.getState,

          location: renderProps.location,
          params: renderProps.params,

          cookies: req.cookies

        };

        trigger('fetch', renderProps.components, locals)
          .then(() => {

            const elements = (
              <Component state={store.getState()} config={{cookieName: 'Quote'}}>
                <Provider store={store}>
                  <RouterContext {...renderProps} />
                </Provider>
              </Component>
            );

            let html = '';
            try {
              html = `<!doctype html>${renderToStaticMarkup(elements)}`;
            } catch (renderError) {
              return next(renderError);
            }

            //send the response
            if (send) {
              send(res, html);
            } else {
              res.send(html);
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
  };
}
