// This helper comes with a lot of TS issues. That's why we are disabling the TS checks bluntly.
// The long term solution should be to use stencils bindings for React:
// https://stenciljs.com/docs/react#bindings
// @ts-nocheck
import { RefObject } from 'react';

/**
 * Helper function adding support for web components rich data props and
 * custom events in React.
 *
 * Ref. https://custom-elements-everywhere.com/
 * This might also interest you: https://github.com/facebook/react/issues/11347
 *
 * @param {*} props component properties
 * @param {*} customEvents component events
 *
 * Example usage:
 *
 * <d4l-button text="Test"
 *   ref={webComponentWrapper({
 *     handleClick: () => alert('test'),
 *   })}
 * />
 */

class WebComponentWrapper<T extends object> {
  constructor(props: Partial<T>, customEvents: object) {
    Object.assign(this, { props, customEvents });
    return this.ref.bind(this);
  }

  ref(element) {
    if (element) {
      this.element = element;
      this.addProps();
      this.forEachCustomEvent((eventName, handler) =>
        element.addEventListener(eventName, handler)
      );
      return element;
    }

    if (this.element) {
      this.forEachCustomEvent((eventName, handler) =>
        this.element.removeEventListener(eventName, handler)
      );
    }

    return this.element;
  }

  addProps() {
    const { props, element } = this;
    Object.keys(props).forEach(key => {
      element[key] = props[key];
    });
  }

  forEachCustomEvent(cb) {
    const { customEvents } = this;
    Object.keys(customEvents)
      .filter(key => typeof customEvents[key] === 'function')
      .forEach(key => cb(key, customEvents[key]));
  }
}

const WebComponentWrapperInstance = <T extends object = {}>(
  props: Partial<T> = {},
  customEvents: object = {}
) =>
  (new WebComponentWrapper<T>(props, customEvents) as unknown) as RefObject<
    HTMLElement
  >;

export default WebComponentWrapperInstance;
