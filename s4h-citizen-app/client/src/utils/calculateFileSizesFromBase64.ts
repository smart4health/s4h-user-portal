import formatBytes from './formatBytes';

export function calculateFileSizesFromBase64(filesData: string[]): string {
  const filesSize = filesData.reduce((result, fileData) => {
    return result + fileData.replace(/=/g, '').length * 0.75;
  }, 0);

  return formatBytes(filesSize);
}
