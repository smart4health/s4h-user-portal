import React from 'react';
import { render } from '../../utils/test-utils';
import Tag from './Tag';

describe('Tag', () => {
  describe('Rendering', () => {
    it('displays the text when passed via props', () => {
      const { container } = render(<Tag text="hello world" />);
      expect(container.querySelector('d4l-tag')?.getAttribute('text')).toEqual(
        'hello world'
      );
    });
    it('has default color set to neutral extra lightest', () => {
      const { container } = render(<Tag text="hello world" />);
      expect(container.querySelector('d4l-tag')?.getAttribute('classes')).toContain(
        'Tag--neutral-extra-lightest'
      );
    });
    it('has pointer events restored when handleClick prop is passed', () => {
      const handleClickMock = jest.fn();
      const { container } = render(
        <Tag text="hello world" handleClick={handleClickMock} />
      );
      expect(container.querySelector('d4l-tag')?.getAttribute('classes')).toContain(
        'Tag--is-clickable'
      );
    });
  });
  describe('Functionality', () => {
    // Doesnt work as the events on web components doesnt work.
    // This is an example to showcase potential pitfalls in the current setup
    // it('handles click when a handleClick prop is passed', () => {
    //   const handleClickMock = jest.fn();
    //   const { container } = render(
    //     <Tag text="hello world" handleClick={handleClickMock} />
    //   );
    //   userEvent.click(container.querySelector('d4l-tag')!);
    //   expect(handleClickMock).toHaveBeenCalledTimes(1);
    // });
  });
});
