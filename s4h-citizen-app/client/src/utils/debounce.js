/*
 * Based on https://davidwalsh.name/javascript-debounce-function
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 */
function debounce(func, wait, immediate = false) {
  let timeout;
  return function() {
    const context = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}

export default debounce;
