const byteCountFromObject = (data: object): number =>
  new Blob([JSON.stringify(data)]).size;

export default byteCountFromObject;
