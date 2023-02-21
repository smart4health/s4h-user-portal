import React from 'react';
import { render } from '../../../utils/test-utils';
import { NotFoundComponent } from '../NotFoundComponent';

describe('NotFoundComponent', () => {
  it('renders without crashing', () => {
    const { container } = render(<NotFoundComponent />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
