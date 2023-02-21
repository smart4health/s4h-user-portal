import React from 'react';
import { render, screen } from '../../../utils/test-utils';
import NavLinks from './NavLinks';

describe('NavLinks', () => {
  describe('when in sharing mode', () => {
    it('renders a download button', () => {
      render(
        <NavLinks
          handleLinkClick={() => {}}
          isMobileNavOpen={false}
          navLinks={[]}
          isSharing={true}
        />
      );

      expect(
        screen.queryByTestId('navigation-download-data-button')
      ).toBeInTheDocument();
    });
  });

  describe('when not in sharing mode', () => {
    it('does not render a download button', () => {
      render(
        <NavLinks
          handleLinkClick={() => {}}
          isMobileNavOpen={false}
          navLinks={[]}
          isSharing={false}
        />
      );

      expect(
        screen.queryByTestId('navigation-download-data-button')
      ).not.toBeInTheDocument();
    });
  });
});
