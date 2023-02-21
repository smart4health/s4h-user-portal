// @ts-ignore
import createStore from 'react-waterfall';
import { Store } from '../types';
import actionsCreators from './actions';
import initialState from './state';

const config = {
  initialState,
  actionsCreators,
};

const store: Store = createStore(config);
export const { Provider, connect, actions, subscribe, getState } = store;

/**
 * STORE LISTENER
 *
 * If something of note that affects the global state of the application
 * happens it can be handled here
 *
 * add (action, store) params in the callback and you can consol.warn changes
 *
 */
subscribe(() => {});
