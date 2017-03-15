# rechannel

Opinionated glue for building web apps with React and Redux.

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

//returns a middleware function that creates a store, sets up the router, pre-fetches necessary data
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

```js
rechannel(options : object)
```

Create a store, set up the router, pre-fetch necessary data
and render the page.

**Options:**

Common options:

- `routes : Element|function` _Required_. A `<Route/>` element or a function creating a `<Route/>` element. Function are passed the `getState()` and `dispatch()` methods from the redux store (useful for restricting access in a `onEnter` hook). Learn more about configuring routes in the [React Router docs](https://github.com/reactjs/react-router/blob/master/docs/guides/RouteConfiguration.md).
- `reducer : object` _Required_. A keyed object of reducer functions that may be passed to `combineReducers()`. Learn more about reducer functions in the [Redux docs](http://redux.js.org/docs/Glossary.html#reducer).
- `middleware : array<function>` Optional. An array of middleware functions. Learn more about middleware functions in the [Redux docs](http://redux.js.org/docs/Glossary.html#middleware).
- `enhancer : array<function>` Optional. An array of enhancer functions. Learn more about enhancer functions in the [Redux docs](http://redux.js.org/docs/Glossary.html#store-enhancer).
- `history : History` Optional. A [history](https://www.npmjs.com/package/history) instance. Default's to `react-router`'s `browserHistory` on the client and the result of `react-router`'s `createMemoryHistory` on the server. Learn more about history objects in the `react-router` [Histories docs](https://github.com/reactjs/react-router/blob/master/docs/guides/Histories.md).

Hooks:

- `$init : function`  Optional. Called after the redux store is initialised. May return a promise.
- `$load : function`  Optional. Called after any data is (pre-)loaded. May return a promise.

Client specific options:

- `element : HTMLElement` Optional. The `HTMLElement` which React will render into. Defaults to `document.querySelector('#app')`.

Server specific options:

- `html : Component` Optional. A component that renders the root HTML. Passed the Redux `state` and the React Router component(s) as `children` via `props`. Defaults to [this component](https://github.com/jameslnewell/rechannel/tree/master/lib/createHtml.js).
- `send : function(res, html)` Optional. A function that allows customisation of the response sent by the server. Passed the response object and a HTML string.

**Returns:**

Returns nothing on the client. Returns an `express` middleware function on the server.

**Note:** On the client, routes aren't re-created for each time you navigate to a new page, if you're using a factory function to create the routes and utilising the `cookies` or `query` parameters,
the routes won't be re-created with the new query or cookie values. The route factory function will only be re-evaluated when you re-load the page.

```js
createHtml(options : object)
```

Create a React component for rendering `<html>` on the server.

**Options:**

- `title : string|function`
- `script : string|Array<string>`
- `style : string|Array<string>`

**Returns:**

Returns a React component for rendering `<html>` on the server.

## Change log

### 1.0.0

- break: removed data pre-fetching
- break: use latest `react-router`
- break: bump minimal version of react

### 0.10.0

- add: support server rendered async routes as per https://github.com/ReactTraining/react-router/blob/master/docs/guides/ServerRendering.md#async-routes

### 0.9.0

- add: added `headers` as a parameter for all hooks
- add: now passing `query`, `cookies` and `headers` to your `Html` component

### 0.8.0

- add: added the ability to provide a custom `history` object
- add: added `redux-immutable-state-invariant` to non-production builds which trigger an error when the redux state has been mutated
- add: added validation around some of the `options` to assist developers in finding problems earlier

### 0.7.0

- add: added a `query` parameter to the `$init`, `$load` and `fetch` hooks

### 0.6.2-3

- fix: fixed a bug where routes weren't being re-created per request so conditional routing resulted in outcomes

### 0.6.0

- add: added `$init()` and `$load()` hooks

### 0.5.0

- add: allow routes to be a function

### 0.4.2

- fix: add keyword metadata

### 0.4.1

- fix: `createHtml()` parameters `script` and `style` need to be cast to arrays

### 0.4.0

- add: `createHtml()` parameters `script` and `style` now accept an array of script and style files

### 0.3.0

- break: turned the `Html` component into a factory function to allow customisation of the `<html>` title, script and style names

## To do

- write tests
- rename `fetch` trigger to `load`
- allow the `reducer` to be a single reducer function
- allow the `middleware` and `enhancer` parameters to be a function call that receives the `req` in order to be configured e.g. `redux-effects-cookie`
- clean-up `locals` passed to `redial` - allow them to be user configurable
