import { determineViewportSize, ViewportSize } from '../globalsSlice';

describe('globalsSlice', () => {
  it('should return viewportSize narrow when innerWidth is less than 780px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    });
    expect(determineViewportSize()).toBe(ViewportSize.NARROW);
  });
  it('should return viewportSize medium when innerWidth is greater than 779px and less than 960px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 780,
    });
    expect(determineViewportSize()).toBe(ViewportSize.MEDIUM);
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 959,
    });
    expect(determineViewportSize()).toBe(ViewportSize.MEDIUM);
  });
  it('should return viewportSize wide when innerWidth is geater than 959px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 960,
    });
    expect(determineViewportSize()).toBe(ViewportSize.WIDE);
  });
});
