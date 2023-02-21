/* The handshake connections which give us information on the existing shared sessions come from
permissions end point. And these are applications with app_name containing handshake. This slice is 
dedicated to obtaining handshake connections, though it was written in mind with ability to extend it
to the applications usecase
*/
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { AppState } from '../../redux';
import * as applicationService from '../../services/applications';
import {
  actions as waterfallGlobalActions,
  getState as waterfallGlobalState,
} from '../../store';
import { Application, IApplication } from '../../types';

// TODO: IApplication has to be migrated
const adapters = {
  applications: createEntityAdapter<IApplication>(),
};

interface ApplicationsState {
  isLoading: boolean;
  data: {
    applications: EntityState<IApplication>;
  };
}

const initialState: ApplicationsState = {
  isLoading: false,
  data: {
    applications: adapters.applications.getInitialState(),
  },
};

const {
  selectById: selectApplicationById,
  selectAll: selectAllApplications,
} = adapters.applications.getSelectors(
  (state: AppState) => state.handshakeConnections.data.applications
);

const revokeApplicationAccess = createAsyncThunk(
  'applicationView/revokeApplicationAccess',
  async (application: IApplication, { getState }) => {
    // Revoking would be easier if the whole application is passed
    // This would also help to make it easier to update the store accordingly
    const state = getState() as AppState;
    const accessToken = waterfallGlobalState().access_token!;
    const applications = selectAllApplications(state);
    const applicationPermissions = applications.map(application => ({
      permission_id: application.permission_id,
      grantee_public_key: application.grantee_public_key,
    }));
    await applicationService.revokeAccessOfApplication(
      accessToken,
      application.permission_id,
      applicationPermissions
    );
    const updatedApplications = applications.filter(
      app => app.id !== application.id
    );
    return updatedApplications;
  }
);

const getApplications = createAsyncThunk(
  'applicationView/getApplications',
  async () => {
    const accessToken = waterfallGlobalState().access_token!;

    const applications: Application[] = await applicationService.fetchApplications(
      accessToken
    );
    // Removes duplicates
    // Removes revoked applications
    // Process the application to include permission_id
    const filteredApplications = applications.reduce(
      (accumulator: IApplication[], application: Application) => {
        !accumulator.find(
          myApplication => myApplication.app_id === application.app_id
        ) &&
          !!application.app_name &&
          application.revoked === null &&
          accumulator.push({
            ...application,
            permission_id: application.id,
          });
        return accumulator;
      },
      []
    );
    return filteredApplications;
  }
);

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(revokeApplicationAccess.fulfilled, (state, action) => {
        adapters.applications.setAll(state.data.applications, action.payload);
      })
      .addCase(revokeApplicationAccess.rejected, () => {
        waterfallGlobalActions.setNotification('error_data_generic', 'error');
      })
      .addCase(getApplications.pending, state => {
        state.isLoading = true;
      })
      .addCase(getApplications.fulfilled, (state, action) => {
        const handshakeApplications = action.payload;
        state.isLoading = false;
        adapters.applications.setAll(state.data.applications, handshakeApplications);
      })
      .addCase(getApplications.rejected, state => {
        state.isLoading = false;
      });
  },
});

const { reducer } = applicationSlice;

// utils

const getHandshakeConnections = (applications: Application[] | IApplication[]) => {
  const handshakeConnections = applications.filter(({ app_name }) =>
    app_name?.toLowerCase().includes('handshake')
  );
  return handshakeConnections;
};

// selectors

const selectHandshakeConnections = (state: AppState): IApplication[] => {
  const applications = selectAllApplications(state);
  const handshakeConnections = getHandshakeConnections(
    applications
  ) as IApplication[];
  return handshakeConnections;
};

const selectHasApplications = (state: AppState): boolean => {
  const applications = selectAllApplications(state);
  return !!applications.length;
};

export { getHandshakeConnections };
export { revokeApplicationAccess, getApplications };
export {
  selectAllApplications,
  selectHasApplications,
  selectApplicationById,
  selectHandshakeConnections,
};
export default reducer;
