import { useEffect, useRef, useState } from 'react';

const useCurrentPageNumber = (
  container: HTMLDivElement | null,
  targets: HTMLDivElement[],
  pageRenderStatuses: boolean[],
  pageCount: number | null
): number | null => {
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const observer = useRef<IntersectionObserver>();

  useEffect(() => {
    const allPagesFullyRendered =
      pageRenderStatuses.length === pageCount && pageRenderStatuses.every(Boolean);

    if (observer.current || !container || !allPagesFullyRendered) {
      return;
    }

    console.debug('Observer is being setup ...');
    const intersectionObserver = new IntersectionObserver(
      entries => {
        /*
          This implementation makes the hard assumption that two distinct pages will
          never at the same time (or around the same delta of time) reach their
          intersection ratio threshold. This is because pages are rendered vertically
          beneath each other and when the pages are scrolled through the "page just
          intersected the container by x amount" event should always happen in sequence
          for each respective page. Also we only consider the "intersecting in" events
          and ignore the "intersecting out" events of each page.

          This assumption allows us to consider the entries array that the intersection
          observer provides us with to always have exactly one entry.
        */

        const { isIntersecting, target } = entries[0];

        if (!isIntersecting) {
          return;
        }

        const pageNumberOfTarget = target.getAttribute('data-page-number');
        if (pageNumberOfTarget) {
          console.debug(
            'Page',
            pageNumberOfTarget,
            'started intersecting by defined threshold'
          );

          setCurrentPage(parseInt(pageNumberOfTarget));
        }
      },
      {
        root: container,
        threshold: [0.25],
      }
    );

    observer.current = intersectionObserver;

    targets.forEach(page => {
      intersectionObserver.observe(page);
    });

    return () => {
      console.debug('Observer is being disconnected...');
      observer.current?.disconnect();
    };
  }, [container, targets, pageRenderStatuses, pageCount]);

  return currentPage;
};

export default useCurrentPageNumber;
