# rechannel

Opinionated glue for creating web apps with React and Redux.

Glues together `react`, `redux`, `react-router`, `react-router-redux`, `redial` and `redux-devtools-extension`.
Useful for both client side _and_ UniversalJS apps.

> This package is experimental and the API may receive breaking changes before v1.0.0.

## Installation

    npm install --save rechannel react react-dom react-redux \
      react-router react-router-redux redial redux

## Usage

### Client

```javascript
import rechannel from 'rechannel';
import routes from './routes';
import reducer from './reducer';

//creates a store, sets up the router, pre-fetches the necessary data
// and renders the page
rechannel({
  routes,
  reducer
});

```

> Note: If you're not using a server you'll have to create your own HTML file.

Try the [example](https://github.com/jameslnewell/rechannel/tree/master/example/client.js).

### Server

```javascript

import express from 'express';
import rechannel from 'rechannel';
import routes from './routes';
import reducer from './reducer';

const app = express();

app.use('/', express.static(`./public`));

//returns a middleware function that creates a store, sets up the router, pre-fetches the necessary data
// and renders the page
app.use(rechannel({
  routes,
  reducer
}));

const server = app.listen(8000, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('App running at http://%s:%s', host, port);
});

```

Try the [example](https://github.com/jameslnewell/rechannel/tree/master/example/server.js).

## API

```
rechannel(options : object)
```

**Options:**

Common options:

- `routes : Component` _Required_. A route configuration. Learn more about configuring routes in the [React Router docs](https://github.com/reactjs/react-router/blob/master/docs/guides/RouteConfiguration.md).
- `reducer : object` _Required_. A keyed object of reducer functions that may be passed to `combineReducers()`. Learn more about reducer functions in the [Redux docs](http://redux.js.org/docs/Glossary.html#reducer).
- `middleware : array<function>` Optional. An array of middleware functions. Learn more about middleware functions in the [Redux docs](http://redux.js.org/docs/Glossary.html#middleware).
- `enhancer : array<function>` Optional. An array of enhancer functions. Learn more about enhancer functions in the [Redux docs](http://redux.js.org/docs/Glossary.html#store-enhancer).

Client specific options:

- `element : HTMLElement` Optional. The `HTMLElement` which React will render into. Defaults to `document.querySelector('#app')`.

Server specific options:

- `html : Component` Optional. A component that renders the root HTML. Passed the Redux `state` and the React Router component(s) as `children` via `props`. Defaults to [this component](https://github.com/jameslnewell/rechannel/tree/master/lib/Html.js).
- `send : function(res, html)` Optional. A function that allows customisation of the response sent by the server. Passed the response object and a HTML string.

## To do

- allow the `reducer` to be a single reducer function
- allow the `middleware` and `enhancer` parameters to be a function call that receives the `req` in order to be configured e.g. `redux-effects-cookie`
- clean-up `locals` passed to `redial`