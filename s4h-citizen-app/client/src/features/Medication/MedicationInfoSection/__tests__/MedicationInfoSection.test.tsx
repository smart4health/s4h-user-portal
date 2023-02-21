import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import MedicationInfoSection from '../MedicationInfoSection';

afterEach(cleanup);
describe('MedicationInfoItem', () => {
  it('it should render a headline', () => {
    const props = {
      headline: 'This is my headline',
    };

    render(
      <MedicationInfoSection {...props}>
        <div data-testid="child-component">my child component</div>
      </MedicationInfoSection>
    );
    const headline = screen.getByTestId('info-section-headline');
    const child = screen.getByTestId('child-component');

    expect(headline).toBeDefined();
    expect(child).toBeDefined();
  });
});
