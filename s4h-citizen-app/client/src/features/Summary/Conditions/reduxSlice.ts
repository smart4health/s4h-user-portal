import { Problem } from '@d4l/s4h-fhir-xforms';
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
  deleteConditionResources,
  DeleteConditionsResult,
  getConditions,
} from '../../../services/conditions';
import { actions as waterfallGlobalActions } from '../../../store';

const adapters = {
  conditions: createEntityAdapter<Problem>({
    selectId: condition => condition.problemId,
  }),
};

export interface ConditionsState {
  data: {
    conditions: EntityState<Problem>;
  };
}

const initialState: ConditionsState = {
  data: {
    conditions: adapters.conditions.getInitialState(),
  },
};

const fetchConditions = createAsyncThunk('conditions/fetchConditions', async () => {
  const response = await getConditions();
  return response;
});

const deleteConditions = createAsyncThunk(
  'conditions/deleteConditions',
  async (conditionIds: EntityId[]) => {
    return await deleteConditionResources(conditionIds);
  }
);

const conditionsSlice = createSlice({
  name: 'conditions',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: builder =>
    builder
      .addCase(fetchConditions.fulfilled, (state, action) => {
        if (action.payload) {
          adapters.conditions.setAll(state.data.conditions, action.payload);
        }
      })
      .addCase(fetchConditions.rejected, (_state, action) => {
        console.log('Error during fetching problem list', action);
      })
      .addCase(
        deleteConditions.fulfilled,
        (state, action: PayloadAction<DeleteConditionsResult>) => {
          const { deletedConditionIds, hasErrored } = action.payload;

          adapters.conditions.removeMany(state.data.conditions, deletedConditionIds);

          if (hasErrored) {
            waterfallGlobalActions.setNotification(
              'delete_conditions_error.message',
              'error'
            );
          }
        }
      ),
});

// Selectors
export const {
  selectById: selectConditionById,
  selectIds: selectAllConditionIds,
  selectAll: selectAllConditions,
  selectTotal: selectConditionsCount,
} = adapters.conditions.getSelectors(
  (state: AppState) => state.conditions.data.conditions
);

export const selectIsConditionsEmpty = (state: AppState) => {
  const totalConditions = selectConditionsCount(state);
  return !totalConditions;
};

export const selectHasConditions = (state: AppState) =>
  selectConditionsCount(state) > 0;

export const selectActiveConditions = (state: AppState) =>
  selectAllConditions(state).filter(
    condition => condition.clinicalStatus?.resolvedText === 'Active'
  );

export const selectActiveConditionsIds = (state: AppState) =>
  selectActiveConditions(state).map(condition => condition.problemId);

const { actions, reducer } = conditionsSlice;

const { reset: resetConditions } = actions;

export { resetConditions };
// Thunks
export { fetchConditions, deleteConditions };

export default reducer;
