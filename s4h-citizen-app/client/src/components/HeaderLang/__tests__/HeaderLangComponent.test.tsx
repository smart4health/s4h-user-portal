import React from 'react';
import HeaderLangComponent from '..';
import { render } from '../../../utils/test-utils';
import HeaderLangSwitch from '../HeaderLangComponent';

describe('HeaderLangComponent', () => {
  it('renders correctly', () => {
    const { container } = render(<HeaderLangComponent />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('HeaderLangSwitch', () => {
  it('renders without crashing', () => {
    const { container } = render(<HeaderLangSwitch />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
