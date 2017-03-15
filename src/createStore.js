import {createStore, compose, applyMiddleware} from 'redux';

/**
 * @param {function}        reducer
 * @param {Array<function>} middlewares
 * @param {Array<function>} enhancers
 */
export default (reducer, middlewares, enhancers) => {

  //add a middleware to freeze the state and prevent errors during dev
  if (process.env.NODE_ENV !== 'production') {
    // middlewares.unshift(
    //   require('redux-immutable-state-invariant')()
    // );
  }

  return createStore(
    reducer,
    window.__INITIAL_STATE__,
    compose(
      applyMiddleware(...middlewares),
      ...enhancers
    )
  );

};
