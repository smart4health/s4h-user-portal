import React from 'react';
import './ScrollToTop.scss';

const ScrollToTop = () => {
  const scrollToTop = () => {
    const viewWrapper = document.getElementById('view-wrapper');
    viewWrapper && viewWrapper.scrollIntoView();
  };
  return (
    <div
      className="ScrollToTop"
      onClick={scrollToTop}
      onKeyPress={scrollToTop}
      role="button"
      tabIndex={0}
    >
      <d4l-icon-chevron-up />
    </div>
  );
};

export default ScrollToTop;
