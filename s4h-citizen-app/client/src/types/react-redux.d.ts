import { AppDispatch, AppState } from '../redux';

declare module 'react-redux' {
  // react-redux's useDispatch hook cannot know that we are using async
  // thunk middleware and therefore dispatch should be thenable. The standard
  // dispatch is not thenable.
  // This next line redeclares the type of the dispatch function returned by
  // useDipatch to be the type of our middleware-enhanced/thenable dispatch
  // function
  export function useDispatch(): AppDispatch;
  export function useSelector<TState = AppState, TSelected = unknown>(
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean
  ): TSelected;
}
