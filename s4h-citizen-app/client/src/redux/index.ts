import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // We ignore anything related to raw records from the SDK as these are
        // not always serializable and don't need to be necessarily. We also
        // preserve the default ignored ation path `meta.arg`.
        ignoredActionPaths: [
          'payload.records',
          'payload.fhirResource',
          'payload.documentRecord',
          'meta.arg',
        ],
        ignoredPaths: ['documentsViewer.data.records', 'externalSharing.privateKey'],
      },
      immutableCheck: {
        ignoredPaths: ['documentsViewer.data.records', 'externalSharing.privateKey'],
      },
    }),
});

export type AppState = ReturnType<typeof rootReducer>;
export type StoreState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
