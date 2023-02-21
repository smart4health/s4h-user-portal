import { useEffect, useRef } from 'react';

export default function useIsMounted(): boolean {
  const componentIsMounted = useRef(true);
  useEffect(
    () => () => {
      componentIsMounted.current = false;
    },
    []
  );
  return componentIsMounted.current;
}
