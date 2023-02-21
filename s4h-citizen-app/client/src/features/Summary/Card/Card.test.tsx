import React from 'react';
import { render } from '../../../utils/test-utils';
import Card from './Card';

describe('Summary Card', () => {
  it('displays the d4l-card component', () => {
    const { container } = render(
      <Card
        id="card"
        title="summary card"
        content={<div>card content</div>}
        footer={<div>card footer</div>}
      />
    );
    expect(container.querySelector('d4l-card')).toBeTruthy();
  });

  describe('top right corner', () => {
    describe('when in sharing mode', () => {
      it('displays the info link if it is provided one', () => {
        const initialState = {
          globals: {
            isSharingMode: true,
          },
        };

        const { container, queryByRole } = render(
          <Card
            id="card"
            title="summary card"
            content={<div>card content</div>}
            infoLink="https://some.url"
          />,
          { initialState }
        );

        expect(queryByRole('link')).toBeInTheDocument();
        expect(container.querySelector('d4l-icon-questionmark')).toBeInTheDocument();
      });
    });

    describe('when not in sharing mode', () => {
      it('does not display the info link even if it is provided one', () => {
        const initialState = {
          globals: {
            isSharingMode: false,
          },
        };

        const { container, queryByRole } = render(
          <Card
            id="card"
            title="summary card"
            content={<div>card content</div>}
            infoLink="https://some.url"
          />,
          { initialState }
        );

        expect(queryByRole('link')).not.toBeInTheDocument();
        expect(
          container.querySelector('d4l-icon-questionmark')
        ).not.toBeInTheDocument();
      });
    });
  });
});
