import React from 'react';
import { render } from '../../../../utils/test-utils';
import Content from '../Content';

describe('Support Content', () => {
  describe('Rendering', () => {
    it('displays the content headline and body', () => {
      const { getByLabelText, getByText } = render(<Content root="eid" id="eid" />);
      expect(getByLabelText('eid.headline')).toBeInTheDocument();
      expect(getByText('eid.headline')).toBeInTheDocument();
      expect(getByText('eid.content')).toBeInTheDocument();
    });
  });
});
