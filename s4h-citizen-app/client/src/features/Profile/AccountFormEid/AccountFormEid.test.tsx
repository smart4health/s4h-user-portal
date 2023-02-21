import React from 'react';
import * as eidServices from '../../../services/eid';
import { act, render, waitFor } from '../../../utils/test-utils';
import { eidGetInfoResponse, eidGetInfoResponseWithEID } from '../mocks';
import AccountFormEid from './AccountFormEid';

describe('AccountFormEid', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('Rendering', () => {
    it('returns null when the devices info call is not completed', async () => {
      act(() => {
        jest
          .spyOn(eidServices, 'fetchEidInfo')
          .mockImplementation(() => Promise.resolve(eidGetInfoResponseWithEID));
      });

      const { container } = render(<AccountFormEid />);

      await waitFor(() => {
        expect(container.firstChild).toEqual(null);
      });
    });
    it('displays the heading when the devices info is loaded', async () => {
      act(() => {
        jest
          .spyOn(eidServices, 'fetchEidInfo')
          .mockImplementation(() => Promise.resolve(eidGetInfoResponseWithEID));
      });

      const { getByText } = render(<AccountFormEid />);

      await waitFor(() => {
        expect(getByText('eid_settings.headline')).toBeInTheDocument();
      });
    });
    it('displays the information text', async () => {
      jest
        .spyOn(eidServices, 'fetchEidInfo')
        .mockImplementation(() => Promise.resolve(eidGetInfoResponseWithEID));
      const { getByText } = render(<AccountFormEid />);

      await waitFor(() => {
        expect(getByText('eid_settings.content')).toBeInTheDocument();
      });
    });
    it('displays the error notification bar with disabled connect button when device info api fail', async () => {
      jest
        .spyOn(eidServices, 'fetchEidInfo')
        .mockImplementation(() => Promise.reject({ status: 400 }));
      const { getByTestId } = render(<AccountFormEid />);

      await waitFor(() => {
        expect(
          getByTestId('account-form-eid-error-notification')
        ).toBeInTheDocument();
        expect(getByTestId('account-form-add-eid-button')).toHaveAttribute(
          'disabled',
          'true'
        );
      });
    });
    it('displays info notification bar and connect button when the device info api call returns no eid device', async () => {
      jest
        .spyOn(eidServices, 'fetchEidInfo')
        .mockImplementation(() => Promise.resolve(eidGetInfoResponse));
      const { getByTestId } = render(<AccountFormEid />);

      await waitFor(() => {
        expect(
          getByTestId('account-form-eid-connect-notification')
        ).toBeInTheDocument();
        expect(getByTestId('account-form-add-eid-button')).toBeInTheDocument();
      });
    });

    it('displays successfully connected notification bar and remove button when the device info api call returns eid device', async () => {
      jest
        .spyOn(eidServices, 'fetchEidInfo')
        .mockImplementation(() => Promise.resolve(eidGetInfoResponseWithEID));
      const { getByTestId } = render(<AccountFormEid />);

      await waitFor(() => {
        expect(
          getByTestId('account-form-eid-success-notification')
        ).toBeInTheDocument();
        expect(getByTestId('account-form-remove-eid-button')).toBeInTheDocument();
      });
    });
  });
  describe('Functionality', () => {
    it('fetches the current eid info when loading the component if not returning from the ausweisapp', async () => {
      let fetchInfoSpy: jest.SpyInstance | undefined = undefined;
      act(() => {
        fetchInfoSpy = jest
          .spyOn(eidServices, 'fetchEidInfo')
          .mockImplementation(() => Promise.resolve(eidGetInfoResponseWithEID));
      });

      render(<AccountFormEid />);
      await waitFor(() => {
        expect(fetchInfoSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
