import React from 'react';
import { render } from '../../../utils/test-utils';
import BackButton from '../BackButton';

describe('BackButton ', () => {
  it('renders correctly', () => {
    const { container } = render(<BackButton />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
