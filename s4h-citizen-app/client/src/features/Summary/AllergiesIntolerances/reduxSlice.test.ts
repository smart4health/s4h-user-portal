import store from '../../../redux';
import * as allergiesIntolerancesService from '../../../services/allergiesIntolerances';
import { cleanup, waitFor } from '../../../utils/test-utils';
import { allergyVerificationAndClinicalMock } from './mocks';
import {
  fetchAllergiesIntolerances,
  resetAllergiesIntolerances,
  selectIsAllergiesIntolerancesEmpty,
} from './reduxSlice';

afterEach(cleanup);

describe('AllergiesIntolerances Slice', () => {
  afterEach(() => {
    store.dispatch(resetAllergiesIntolerances());
  });
  describe('Async Thunks', () => {
    describe('fetchAllergiesIntolerances', () => {
      it('fetchs the allergies and intolerances and returns them when the api call is successful', async () => {
        jest
          .spyOn(allergiesIntolerancesService, 'getAllergiesIntolerances')
          .mockResolvedValueOnce([allergyVerificationAndClinicalMock]);
        const response = await store.dispatch(fetchAllergiesIntolerances());
        expect(
          allergiesIntolerancesService.getAllergiesIntolerances
        ).toHaveBeenCalledTimes(1);
        expect(response.payload).toEqual([allergyVerificationAndClinicalMock]);
      });
    });
  });

  describe('Reducers', () => {
    describe('fetchAllergiesIntolerances', () => {
      it('sets the allergies and intolerances when fulfilled', async () => {
        jest
          .spyOn(allergiesIntolerancesService, 'getAllergiesIntolerances')
          .mockResolvedValueOnce([allergyVerificationAndClinicalMock]);
        await store.dispatch(fetchAllergiesIntolerances());
        expect(
          store.getState().allergiesIntolerances.data.allergiesIntolerances.entities[
            allergyVerificationAndClinicalMock.allergyIntoleranceId
          ]
        ).toEqual(allergyVerificationAndClinicalMock);
      });
      it('does not set the allergies and intolerances when an getAllergiesIntolerances returns an error', async () => {
        jest
          .spyOn(allergiesIntolerancesService, 'getAllergiesIntolerances')
          .mockRejectedValueOnce({});
        try {
          await store.dispatch(fetchAllergiesIntolerances());
        } catch (error) {
          expect(
            store.getState().allergiesIntolerances.data.allergiesIntolerances
              .entities
          ).toEqual({});
        }
      });
    });
  });

  describe('Selectors', () => {
    describe('selectIsAllergiesIntolerancesEmpty', () => {
      it('returns false if the redux store has no allergies and intolerances', () => {
        const response = selectIsAllergiesIntolerancesEmpty(store.getState());
        expect(response).toEqual(true);
      });
      it('returns true when there are some allergies and intolerances in the store', async () => {
        jest
          .spyOn(allergiesIntolerancesService, 'getAllergiesIntolerances')
          .mockResolvedValueOnce([allergyVerificationAndClinicalMock]);
        await store.dispatch(fetchAllergiesIntolerances());
        await waitFor(() => {
          expect(
            store.getState().allergiesIntolerances.data.allergiesIntolerances
              .entities[allergyVerificationAndClinicalMock.allergyIntoleranceId]
          ).toEqual(allergyVerificationAndClinicalMock);
        });
        const response = selectIsAllergiesIntolerancesEmpty(store.getState());
        expect(response).toEqual(false);
      });
    });
  });
});
