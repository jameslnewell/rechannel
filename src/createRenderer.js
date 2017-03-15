import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import createStore from './createStore';

const isDevMode = process.env.NODE_ENV !== 'production';

/**
 * @param {function|object} reducer
 * @param {Array<function>} middleware
 * @param {Array<function>} enhancer
 */
export default options => {
  const {

    reducer = {},
    middleware = [],
    enhancer = [],

    element,
    routerProps = {},
    routerComponent = BrowserRouter

  } = options;

  //get the element
  const containerElement = element || document.getElementById('app');

  //add the redux-devtools-extension
  if (typeof window === 'object' && typeof window.devToolsExtension !== 'undefined') {
    enhancer.unshift(window.devToolsExtension());
  }

  //create the store
  const store = createStore(reducer, middleware, enhancer);

  const render = Root => {
    ReactDOM.render(
      <Provider store={store}>
        <BrowserRouter {...routerProps}>
          <Root/>
        </BrowserRouter>
      </Provider>,
      containerElement
    );
  };

  //allow the user to hot-reload the reducer
  const replaceReducer = (...args) => store.replaceReducer(...args);

  return {
    render,
    replaceReducer
  };

};
