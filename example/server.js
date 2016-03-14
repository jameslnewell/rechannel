import express from 'express';
import rechannel from '..';
import routes from './routes';
import reducer from './reducer';

const app = express();

app.use('/', express.static(`./public`));

app.use(rechannel({
  routes,
  reducer
}));

const server = app.listen(8000, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('App running at http://%s:%s', host, port);
});
