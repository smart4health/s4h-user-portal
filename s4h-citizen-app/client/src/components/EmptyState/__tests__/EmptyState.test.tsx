import React from 'react';
import EmptyState from '..';
import { render } from '../../../utils/test-utils';
import TitleCaption from '../../TitleCaption';

describe('EmptyState component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <EmptyState
        header={<TitleCaption title="Title" subtitle="Subtitle" />}
        headerClass="header-class"
        content={<div>Content</div>}
        contentClass="content-class"
        footer={<div>Footer</div>}
        footerClass="footer-class"
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
