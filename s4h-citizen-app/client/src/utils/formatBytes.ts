const formatBytes = (numberOfBytes: number) => {
  if (numberOfBytes === 0) {
    return '0 Bytes';
  }
  const UNIT_SEPARATOR = 1024;
  const UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const f = Math.floor(Math.log(numberOfBytes) / Math.log(UNIT_SEPARATOR));
  return `${parseFloat((numberOfBytes / Math.pow(UNIT_SEPARATOR, f)).toFixed(2))} ${
    UNITS[f]
  }`;
};

export default formatBytes;
