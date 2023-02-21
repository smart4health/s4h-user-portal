import React from 'react';
import { render } from '../../../utils/test-utils';
import PinView from '../PinView';

describe('External Sharing PinView', () => {
  describe('Rendering', () => {
    it('displays the notification banner', () => {
      const { getByTestId } = render(<PinView />);

      expect(getByTestId('external-pin-view-notification')).toBeInTheDocument();
    });
  });
});
