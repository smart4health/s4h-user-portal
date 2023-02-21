import React from 'react';
import { render } from '../../../utils/test-utils';
import TwoColumnSidebarHeader from '../Header';
import TwoColumnSidebar from '../TwoColumnSidebar';
const createElement = () => {
  const defaultProps = {
    rootTitle: 'Test title',
    items: [
      { title: 'title1', path: '/go-title1' },
      { title: 'title2', path: '/go-title2' },
    ],
  };

  return (
    <TwoColumnSidebar
      {...defaultProps}
      hasActionButton={false}
      rightColumnId="test-id"
    />
  );
};

describe('TwoColumnSidebar', () => {
  it('renders the sidebar header', () => {
    const { getByText } = render(createElement());
    expect(getByText('Test title')).toBeInTheDocument();
  });
  it('renders the sidebar menu items', () => {
    const { getAllByRole } = render(createElement());
    expect(getAllByRole('tab')).toHaveLength(2);
  });
  it('renders header subtitle if provided', () => {
    const { getByText } = render(
      <TwoColumnSidebarHeader
        title="test title"
        subtitle="test subtitle"
        hasActionButton={false}
      />
    );
    expect(getByText('test subtitle')).toBeInTheDocument();
  });
  it("doesn't render header subtitle if not provided", () => {
    const { queryByText } = render(
      <TwoColumnSidebarHeader title="test title" hasActionButton={false} />
    );
    expect(queryByText('test subtitle')).not.toBeInTheDocument();
  });
});
