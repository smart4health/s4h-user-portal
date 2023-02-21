import '@d4l/web-components-library/dist/d4l-ui/d4l-ui.css';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider as ReduxProvider } from 'react-redux';
import { Router } from 'react-router-dom';
import App from './App';
import './App.scss';
import browserHistory from './browserHistory';
import { ScrollToTop } from './components';
import i18n from './i18n';
import GHTheme from './Material';
import store from './redux';
import './registerWebComponents';
import { Provider as ReactWaterfallProvider } from './store';
import analytics from './utils/analytics';

ReactDOM.render(
  <Router history={analytics(browserHistory)}>
    <ReduxProvider store={store}>
      <ReactWaterfallProvider>
        <I18nextProvider i18n={i18n}>
          <MuiThemeProvider theme={GHTheme}>
            <ScrollToTop />
            <App />
            <div id="modal-root" />
          </MuiThemeProvider>
        </I18nextProvider>
      </ReactWaterfallProvider>
    </ReduxProvider>
  </Router>,
  document.getElementById('root')
);
