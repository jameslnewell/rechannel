import React from 'react';

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
        <div id="app">{children}</div>
        <script dangerouslySetInnerHTML={{__html: `window.__INITIAL_STATE__=${JSON.stringify(state)}`}}/>
        <script src="index.js"></script>
      </body>
    </html>
  );
}
