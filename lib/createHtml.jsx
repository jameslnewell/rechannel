import React from 'react';
import {renderToString} from 'react-dom/server';

/**
 * Create a react component for rendering the <html>
 * @param   {object}                [options]
 * @param   {string}                [options.title]
 * @param   {string|Array<script>}  [options.script]
 * @param   {string|Array<script>}  [options.style]
 * @returns {Html}
 */
export default function(options) {

  const title = options && options.title || 'rechannel example';
  const scripts = options && options.script && [].concat(options.script) || ['index.js'];
  const styles = options && options.style && [].concat(options.style) || ['index.css'];

  return function Html(props) {
    const {state, children} = props;
    return (
      <html>
      <head>
        <meta charSet="UTF-8"/>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        {styles.map(style => (<link key={style} rel="stylesheet" href={style}/>))}
      </head>
      <body>
        <div id="app" dangerouslySetInnerHTML={{__html: renderToString(children)}}/>
        <script dangerouslySetInnerHTML={{__html: `window.__INITIAL_STATE__=${JSON.stringify(state)}`}}/>
        {scripts.map(script => (<script key={script} src={script}></script>))}
      </body>
      </html>
    );
  }

};



