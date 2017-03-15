import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import createStore from './createStore';


const Root = () => (
  //        ${scripts.map(script => `<link rel="preload" href="${script}" as="script"/>`).join('\n')}
  <html>
    <head>
      <style>
        ${css}
      </style>
      <link href="${assetPath('client.css')}" rel="stylesheet"/>
    </head>
    <body>
    <div id="app">${html}</div>
    <script src="${assetPath('vendor.js')}" defer></script>
    <script src="${assetPath('client.js')}" defer></script>
    </body>
  </html>
);

export default options => {
  const {

    reducer = {},
    middleware = [],
    enhancer = []

  } = options;

  const middleware = (req, res) => {

    //create the store
    const store = createStore(reducer, middleware, enhancer);

    //render to HTML
    const routerContext = {};
    const html = renderToStaticMarkup(
      <Provider store={store}>
        <StaticRouter location={req.url} context={routerContext}>
          <Root/>
        </StaticRouter>
      </Provider>
    );

    if (routerContext.url) {
      res.redirect(302, routerContext.url);
    } else {
      res.send(`<!doctype html>${html}`);
    }

  };

  middleware.replaceComponent = () => {};
  middleware.replaceReducer = () => {};

  return middleware;
};
