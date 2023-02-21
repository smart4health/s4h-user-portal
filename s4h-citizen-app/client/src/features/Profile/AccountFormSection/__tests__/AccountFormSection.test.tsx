import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import AccountFormSection from '../AccountFormSection';

afterEach(cleanup);
describe('MedicationInfoItem', () => {
  it('renders a headline', () => {
    const props = {
      headline: 'This is my headline',
    };

    render(
      <AccountFormSection {...props}>
        <div data-testid="child-component">my child component</div>
      </AccountFormSection>
    );
    const headline = screen.getByTestId('account-form-section-headline');
    const child = screen.getByTestId('child-component');

    expect(headline).toBeDefined();
    expect(child).toBeDefined();
  });
});
