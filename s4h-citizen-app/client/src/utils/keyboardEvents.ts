import { KeyboardEvent } from 'react';

export const isEnter = (event: KeyboardEvent) => 'Enter' === event.key;

export const isSpacebar = (event: KeyboardEvent) =>
  [' ', 'Spacebar'].includes(event.key);

export const isArrowUp = (event: KeyboardEvent) =>
  ['ArrowUp', 'Up'].includes(event.key);

export const isArrowDown = (event: KeyboardEvent) =>
  ['ArrowDown', 'Down'].includes(event.key);
