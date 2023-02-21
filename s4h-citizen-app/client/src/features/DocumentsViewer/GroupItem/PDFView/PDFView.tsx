import React, { useLayoutEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import PDFPageCounter from './PDFPageCounter';
import './PDFView.scss';
import useCurrentPageNumber from './useCurrentPageNumber';

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/js/pdf.worker.js`;

interface Props {
  fileData: string;
}

const PDFView: React.FunctionComponent<Props> = ({ fileData }) => {
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pdfLoaded, setPDFLoaded] = useState(false);
  const [pageRenderStatuses, setPageRenderStatuses] = useState<boolean[]>([]);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  const container = useRef<HTMLDivElement>(null);
  const pdfPages = useRef<HTMLDivElement[]>([]);

  const currentPage = useCurrentPageNumber(
    container.current,
    pdfPages.current,
    pageRenderStatuses,
    pageCount
  );

  useLayoutEffect(() => {
    const containerWidth = container.current?.getBoundingClientRect().width;
    setContainerWidth(containerWidth || null);
  }, []);

  return (
    <div ref={container} className="GroupItemPDFView">
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div className="GroupItemPDFView__scrollable-pages-container" tabIndex={0}>
        <Document
          file={fileData}
          onLoadSuccess={({ numPages }) => {
            setPageCount(numPages);
            setPDFLoaded(true);
          }}
          loading=""
        >
          {pdfLoaded &&
            // [0..pageCount - 1].map
            [...new Array(pageCount).keys()].map(index => (
              <Page
                key={index + 1}
                inputRef={pageElement =>
                  pageElement !== null && (pdfPages.current[index] = pageElement)
                }
                pageNumber={index + 1}
                width={containerWidth || undefined}
                renderTextLayer={false}
                onRenderSuccess={() => {
                  setPageRenderStatuses(pageRenderStatus => {
                    pageRenderStatus[index] = true;
                    return [...pageRenderStatus];
                  });
                }}
                loading=""
              />
            ))}
        </Document>
      </div>
      {currentPage && pageCount && pageCount > 1 && (
        <PDFPageCounter currentPageNumber={currentPage} pageCount={pageCount} />
      )}
    </div>
  );
};

export default PDFView;
