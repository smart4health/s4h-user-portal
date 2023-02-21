/* eslint-disable */
import {
  applyPolyfills,
  defineCustomElements,
  JSX as LocalJSX,
} from '@d4l/web-components-library/dist/loader';
import { HTMLAttributes } from 'react';

type StencilToReact<T> = {
  [P in keyof T]?: T[P] &
    Omit<HTMLAttributes<Element>, 'className'> & {
      class?: string;
    };
};

declare global {
  export namespace JSX {
    interface IntrinsicElements extends StencilToReact<LocalJSX.IntrinsicElements> {}
  }
}

applyPolyfills().then(() => {
  defineCustomElements(window);
});
