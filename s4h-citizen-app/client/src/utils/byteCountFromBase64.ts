const byteCountFromBase64 = (base64: string): number =>
  base64.replace(/=/g, '').length * 0.75;
export default byteCountFromBase64;
