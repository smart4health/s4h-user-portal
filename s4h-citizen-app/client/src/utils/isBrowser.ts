const browserType = {
  safari:
    navigator.userAgent.indexOf('Safari') !== -1 &&
    navigator.userAgent.indexOf('Chrome') === -1 &&
    // @ts-ignore
    !window.MSStream,
  firefox:
    // @ts-ignore
    navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && !window.MSStream,
};

export default browserType;
