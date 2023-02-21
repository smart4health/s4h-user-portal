import React from 'react';
import { cleanup, render } from '../../../../utils/test-utils';
import MedicationInfoItem from '../MedicationInfoItem';

afterEach(cleanup);
describe('MedicationInfoItem', () => {
  it('renders the item provided when their content is not empty', () => {
    const props = {
      items: [
        {
          title: 'medication.strength.title',
          content: '600 mg/tablet',
        },
      ],
    };

    const { getByTestId } = render(<MedicationInfoItem {...props} />);
    expect(getByTestId('info-item-content')).toHaveTextContent(
      'medication.strength.title'
    );
    expect(getByTestId('info-item-content')).toHaveTextContent('600 mg/tablet');
  });

  it('renders all items passed via props', () => {
    const props = {
      items: [
        {
          title: 'medication.strength.title',
          content: '600 mg/tablet',
        },
        {
          title: 'medication.strength.title',
          content: '600 mg/tablet',
        },
      ],
    };
    const { getAllByTestId } = render(<MedicationInfoItem {...props} />);

    expect(getAllByTestId('info-item-content')).toHaveLength(2);
  });

  it('renders one item if only one of them has content', () => {
    const props = {
      items: [
        {
          title: 'medication.strength.title',
          content: '',
        },
        {
          title: 'medication.strength.title',
          content: 'My Content',
        },
      ],
    };

    const { getAllByTestId } = render(<MedicationInfoItem {...props} />);
    expect(getAllByTestId('info-item-content')).toHaveLength(1);
  });

  it('renders two items if two of them have content', () => {
    const props = {
      items: [
        {
          title: 'medication.strength.title',
          content: 'Content',
        },
        {
          title: 'medication.strength.title',
          content: 'My Content',
        },
      ],
    };

    const { getAllByTestId } = render(<MedicationInfoItem {...props} />);
    expect(getAllByTestId('info-item-content')).toHaveLength(2);
  });
});
