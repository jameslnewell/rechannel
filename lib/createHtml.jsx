import React from 'react';
import {renderToString} from 'react-dom/server';

/**
 * Create a react component for rendering the <html>
 * @param   object [options]
 * @param   string [options.title]
 * @param   string [options.script]
 * @param   string [options.style]
 * @returns {Html}
 */
export default function(options) {

  const title = options && options.title || 'rechannel example';
  const script = options && options.script || 'index.js';
  const style = options && options.style || 'index.css';

  return function Html(props) {
    const {state, children} = props;
    return (
      <html>
      <head>
        <meta charSet="UTF-8"/>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="stylesheet" href={style}/>
      </head>
      <body>
        <div id="app" dangerouslySetInnerHTML={{__html: renderToString(children)}}/>
        <script dangerouslySetInnerHTML={{__html: `window.__INITIAL_STATE__=${JSON.stringify(state)}`}}/>
        <script src={script}></script>
      </body>
      </html>
    );
  }

};



