import React from 'react';
import { MemoryRouter } from 'react-router';
import { render } from '../../../../utils/test-utils';
import { Support } from '../Support';

describe('Support', () => {
  describe('Rendering', () => {
    it('displays the user account support page by default', () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/support']}>
          <Support />
        </MemoryRouter>
      );
      expect(getByText('user_account.headline')).toBeInTheDocument();
      expect(getByText('user_account.content')).toBeInTheDocument();
    });
  });
});
