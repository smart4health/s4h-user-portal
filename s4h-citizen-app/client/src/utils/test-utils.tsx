import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { I18nextProvider } from 'react-i18next';
import { render } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider as ReduxProvider } from 'react-redux';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
// @ts-ignore
import { FeatureToggleProvider } from 'react-feature-toggles';
import rootReducer from '../redux/reducers';
import GHTheme from '../Material';
import { featureNames, FeatureNamesValues, Flags } from '../config/flags';
import i18n from '../mocks/i18n';
import { customizeInitialState } from '../store/state';
import { RootState } from '../types';
import { Provider as ReactWaterfallProvider } from '../store';

const featureFlagsAllEnabled: Flags = (
  Object.values(featureNames) as FeatureNamesValues[]
).reduce((accumulator, feature) => {
  accumulator[feature] = true;
  return accumulator;
}, {} as Flags);

/* Custom render function which helps us to have a configurable redux store with defined initial state*/

const history = createMemoryHistory();

const customRender = (
  ui: ReactElement,
  {
    // Ignoring below as a way to type this rightly to Partial<StoreState> was not found
    // @ts-ignore
    initialState,
    store = configureStore({
      reducer: rootReducer,
      preloadedState: initialState,
      middleware: getDefaultMiddleware => getDefaultMiddleware(),
    }),
    extendedWaterfallState = {} as Partial<RootState>,
    ...renderOptions
  } = {}
) => {
  const AllTheProviders: React.FC = props => {
    customizeInitialState({
      flags: featureFlagsAllEnabled,
      ...extendedWaterfallState,
    });
    return (
      <Router history={history}>
        <FeatureToggleProvider featureToggleList={featureFlagsAllEnabled}>
          <ReduxProvider store={store}>
            <ReactWaterfallProvider>
              <I18nextProvider i18n={i18n}>
                <MuiThemeProvider theme={GHTheme}>{props.children}</MuiThemeProvider>
              </I18nextProvider>
            </ReactWaterfallProvider>
          </ReduxProvider>
        </FeatureToggleProvider>
      </Router>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

export * from '@testing-library/react';
export { customRender as render, history };
