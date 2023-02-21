import React from 'react';
import { render } from '../../../../utils/test-utils';
import { SupportSidebar } from '../Sidebar';

describe('Support Sidebar', () => {
  it('displays the sidebar headline', () => {
    const { getByText } = render(<SupportSidebar rightColumnId="support" />);
    expect(getByText('sidebar_heading.title')).toBeInTheDocument();
  });

  it('displays all the sidebar items when the medications flag is true', () => {
    const { getByText } = render(<SupportSidebar rightColumnId="support" />);
    expect(getByText('user_account_sidebar.title')).toBeInTheDocument();
    expect(getByText('trust_privacy_sidebar.title')).toBeInTheDocument();
    expect(getByText('eid_sidebar.title')).toBeInTheDocument();
    expect(getByText('medications_sidebar.title')).toBeInTheDocument();
    expect(getByText('conditions_sidebar.title')).toBeInTheDocument();
    expect(getByText('contact_sidebar.title')).toBeInTheDocument();
    expect(getByText('allergies_sidebar.title')).toBeInTheDocument();
  });
});
