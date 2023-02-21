import React from 'react';
import TitleCaption from '..';
import { render } from '../../../utils/test-utils';

describe('TitleCaption component', () => {
  it('renders without crashing', () => {
    const { container } = render(<TitleCaption title="Title" subtitle="Subtitle" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
