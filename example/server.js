import express from 'express';
import rechannel, {createHtml} from '..';
import routes from './routes';
import reducer from './reducer';

const app = express();

app.use('/', express.static(`./public`));

app.use(rechannel({
  routes,
  reducer,
  $init: (...args) => console.log('$init', ...args),
  $load: (...args) => console.log('$load', ...args),
  html: createHtml({title: 'fancy-pants-example'})
}));

const server = app.listen(8000, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('App running at http://%s:%s', host, port);
});
