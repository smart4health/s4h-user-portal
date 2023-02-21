import React from 'react';
import EidCountrySelection from '.';
import * as eidServices from '../../../../services/eid';
import { render, waitFor } from '../../../../utils/test-utils';

describe('EidCountrySelection', () => {
  describe('Rendering', () => {
    beforeEach(() => {
      jest.spyOn(eidServices, 'fetchCountryList').mockImplementationOnce(() =>
        Promise.resolve([
          { countryCode: 'test', country: 'Test country' },
          { countryCode: 'AT', country: 'Austria' },
          { countryCode: 'BE', country: 'Belgium' },
          { countryCode: 'CY', country: 'Cyprus' },
          { countryCode: 'CZ', country: 'Czech Republic' },
          { countryCode: 'EE', country: 'Estonia' },
          { countryCode: 'ES', country: 'Spain' },
          { countryCode: 'GR', country: 'Greece' },
          { countryCode: 'HR', country: 'Croatia' },
          { countryCode: 'IE', country: 'Ireland' },
          { countryCode: 'IS', country: 'Iceland' },
          { countryCode: 'IT', country: 'Italy' },
          { countryCode: 'LT', country: 'Lithuania' },
          { countryCode: 'LU', country: 'Luxembourg' },
          { countryCode: 'LV', country: 'Latvia' },
          { countryCode: 'MT', country: 'Malta' },
          { countryCode: 'NL', country: 'Netherlands' },
          { countryCode: 'NO', country: 'Norway' },
          { countryCode: 'PT', country: 'Portugal' },
          { countryCode: 'SI', country: 'Slovenia' },
        ])
      );
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('displays the enabled country flags', async () => {
      const { container } = render(<EidCountrySelection />);
      await waitFor(() => {
        expect(container.querySelectorAll('d4l-radio').length).toEqual(8);
      });
    });
  });
});
