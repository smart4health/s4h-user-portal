import { AllergyIntolerance } from '@d4l/s4h-fhir-xforms';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityId,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { AppState } from '../../../redux';
import {
  deleteAllergiesIntolerancesResources,
  DeleteAllergiesIntolerancesResult,
  getAllergiesIntolerances,
} from '../../../services/allergiesIntolerances';
import { actions as waterfallGlobalActions } from '../../../store';

const adapters = {
  allergiesIntolerances: createEntityAdapter<AllergyIntolerance>({
    selectId: allergy => allergy.allergyIntoleranceId,
  }),
};

export interface AllergiesIntolerancesState {
  data: {
    allergiesIntolerances: EntityState<AllergyIntolerance>;
  };
}

const initialState: AllergiesIntolerancesState = {
  data: {
    allergiesIntolerances: adapters.allergiesIntolerances.getInitialState(),
  },
};

const fetchAllergiesIntolerances = createAsyncThunk(
  'allergiesIntolerances/fetchAlergiesIntolerances',
  async () => {
    return await getAllergiesIntolerances();
  }
);

const deleteAllergiesIntolerances = createAsyncThunk(
  'allergiesIntolerances/deleteAllergiesIntolerances',
  async (allergiesIntolerancesIds: EntityId[]) => {
    return await deleteAllergiesIntolerancesResources(allergiesIntolerancesIds);
  }
);

const allergiesIntolerancesSlice = createSlice({
  name: 'allergiesIntolerances',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: builder =>
    builder
      .addCase(fetchAllergiesIntolerances.fulfilled, (state, action) => {
        if (action.payload) {
          adapters.allergiesIntolerances.setAll(
            state.data.allergiesIntolerances,
            action.payload
          );
        }
      })
      .addCase(fetchAllergiesIntolerances.rejected, (_state, action) => {
        console.log('Error during fetching of allergies and intolerances', action);
      })
      .addCase(
        deleteAllergiesIntolerances.fulfilled,
        (state, action: PayloadAction<DeleteAllergiesIntolerancesResult>) => {
          const { deletedAllergiesIntolerancesIds, hasErrored } = action.payload;

          adapters.allergiesIntolerances.removeMany(
            state.data.allergiesIntolerances,
            deletedAllergiesIntolerancesIds
          );

          if (hasErrored) {
            waterfallGlobalActions.setNotification(
              'delete_allergies_intolerances_error.message',
              'error'
            );
          }
        }
      ),
});

export const {
  selectAll: selectAllAllergiesIntolerances,
  selectTotal: selectAllergiesIntolerancesCount,
  selectIds: selectAllAllergiesIntolerancesIds,
} = adapters.allergiesIntolerances.getSelectors(
  (state: AppState) => state.allergiesIntolerances.data.allergiesIntolerances
);

export const selectIsAllergiesIntolerancesEmpty = (state: AppState) => {
  const totalAllergiesIntolerances = selectAllergiesIntolerancesCount(state);
  return !totalAllergiesIntolerances;
};

export const selectHasAllergiesIntolerances = (state: AppState): boolean =>
  !!selectAllergiesIntolerancesCount(state);

export const selectActiveAllergiesIntolerances = (state: AppState) =>
  selectAllAllergiesIntolerances(state).filter(
    allergyIntolerance =>
      allergyIntolerance.clinicalStatus?.resolvedText === 'Active'
  );

export const selectActiveAllergiesIntolerancesIds = (state: AppState) =>
  selectActiveAllergiesIntolerances(state).map(
    allergyIntolerance => allergyIntolerance.allergyIntoleranceId
  );

const { actions, reducer } = allergiesIntolerancesSlice;

const { reset: resetAllergiesIntolerances } = actions;

export {
  resetAllergiesIntolerances,
  fetchAllergiesIntolerances,
  deleteAllergiesIntolerances,
};

export default reducer;
