import { simpleGroupIdentifier } from '../../features/DocumentsViewer/mocks';
// import { cleanup, waitFor } from '../../utils/test-utils';
import { provenanceMock } from '../../mocks/provenance';
import store from '../../redux';
import * as provenanceService from '../../services/provenance';
import { getProvenance } from '../provenanceSlice';

describe('provenanceSlice', () => {
  describe('Async Thunks', () => {
    describe('getProvenance', () => {
      it('fetchs the provenance and returns them when the api call is successful', async () => {
        jest
          .spyOn(provenanceService, 'fetchProvenance')
          .mockResolvedValueOnce(provenanceMock);
        const response = await store.dispatch(
          getProvenance({
            resourceId: '12345',
            resourceIdentifiers: [simpleGroupIdentifier],
          })
        );
        expect(provenanceService.fetchProvenance).toHaveBeenCalledTimes(1);
        expect(response.payload).toEqual({
          resourceId: '12345',
          provenances: provenanceMock,
        });
      });
    });
  });
  describe('Reducers', () => {
    describe('getProvenance', () => {
      it('sets the provenance when fulfilled', async () => {
        jest
          .spyOn(provenanceService, 'fetchProvenance')
          .mockResolvedValueOnce(provenanceMock);
        await store.dispatch(
          getProvenance({
            resourceId: '12345',
            resourceIdentifiers: [simpleGroupIdentifier],
          })
        );
        expect(
          store.getState().provenance.data.provenance.entities['12345']
        ).toEqual({
          resourceId: '12345',
          provenances: provenanceMock,
        });
      });
      it('does not set the provenance when an getProvenance returns an error', async () => {
        jest.spyOn(provenanceService, 'fetchProvenance').mockRejectedValueOnce({});
        try {
          await store.dispatch(
            getProvenance({
              resourceId: '12345',
              resourceIdentifiers: [simpleGroupIdentifier],
            })
          );
        } catch (error) {
          expect(store.getState().provenance.data.provenance.entities).toEqual({});
        }
      });
    });
  });
});
