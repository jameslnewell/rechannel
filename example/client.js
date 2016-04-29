import rechannel from '..';
import routes from './routes';
import reducer from './reducer';

rechannel({
  routes,
  reducer,
  $init: (...args) => console.log('$init', ...args),
  $load: (...args) => console.log('$load', ...args)
});
