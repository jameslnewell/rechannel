import React from 'react';
import {renderToString} from 'react-dom/server';

export default function Html(props) {
  const {state, children} = props;
  return (
    <html>
      <head>
        <meta charSet="UTF-8"/>
        <title>rechannel example</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="stylesheet" href={'index.css'}/>
      </head>
      <body>
        <div id="app" dangerouslySetInnerHTML={{__html: renderToString(children)}}/>
        <script dangerouslySetInnerHTML={{__html: `window.__INITIAL_STATE__=${JSON.stringify(state)}`}}/>
        <script src="index.js"></script>
      </body>
    </html>
  );
}

