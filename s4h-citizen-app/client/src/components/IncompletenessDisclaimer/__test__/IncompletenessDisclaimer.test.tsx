import React from 'react';
import { render } from '../../../utils/test-utils';
import IncompletenessDisclaimer from '../IncompletenessDisclaimer';

describe('IncompletessDisclaimer', () => {
  it('renders an icon, a text and a button', () => {
    const { getByTestId, getByText } = render(<IncompletenessDisclaimer />);

    expect(
      getByTestId('incompleteness-disclaimer-close-button')
    ).toBeInTheDocument();
    expect(getByTestId('incompleteness-disclaimer-icon')).toBeInTheDocument();
    expect(
      getByText('sharing.incompleteness_disclaimer.message')
    ).toBeInTheDocument();
  });
});
