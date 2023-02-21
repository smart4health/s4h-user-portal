import store from '../../../redux';
import * as conditionsService from '../../../services/conditions';
import { cleanup, waitFor } from '../../../utils/test-utils';
import { conditionMock } from './mocks';
import {
  fetchConditions,
  resetConditions,
  selectIsConditionsEmpty,
} from './reduxSlice';

afterEach(cleanup);

describe('Conditions Slice', () => {
  afterEach(() => {
    store.dispatch(resetConditions());
  });
  describe('Async Thunks', () => {
    describe('fetchConditions', () => {
      it('fetchs the conditions and returns them when the api call is successful', async () => {
        jest
          .spyOn(conditionsService, 'getConditions')
          .mockResolvedValueOnce([conditionMock()]);
        const response = await store.dispatch(fetchConditions());
        expect(conditionsService.getConditions).toHaveBeenCalledTimes(1);
        expect(response.payload).toEqual([conditionMock()]);
      });
    });
  });

  describe('Reducers', () => {
    describe('fetchConditions', () => {
      it('sets the conditions when fulfilled', async () => {
        jest
          .spyOn(conditionsService, 'getConditions')
          .mockResolvedValueOnce([conditionMock()]);
        await store.dispatch(fetchConditions());
        expect(
          store.getState().conditions.data.conditions.entities[
            conditionMock().problemId
          ]
        ).toEqual(conditionMock());
      });
      it('does not set the conditions when an getConditions returns an error', async () => {
        jest.spyOn(conditionsService, 'getConditions').mockRejectedValueOnce({});
        try {
          await store.dispatch(fetchConditions());
        } catch (error) {
          expect(store.getState().conditions.data.conditions.entities).toEqual({});
        }
      });
    });
  });

  describe('Selectors', () => {
    describe('selectIsConditionsEmpty', () => {
      it('returns false if the redux store has no conditions', () => {
        const response = selectIsConditionsEmpty(store.getState());
        expect(response).toEqual(true);
      });
      it('returns true when there are some conditions in the store', async () => {
        jest
          .spyOn(conditionsService, 'getConditions')
          .mockResolvedValueOnce([conditionMock()]);
        await store.dispatch(fetchConditions());
        await waitFor(() => {
          expect(
            store.getState().conditions.data.conditions.entities[
              conditionMock().problemId
            ]
          ).toEqual(conditionMock());
        });
        const response = selectIsConditionsEmpty(store.getState());
        expect(response).toEqual(false);
      });
    });
  });
});
