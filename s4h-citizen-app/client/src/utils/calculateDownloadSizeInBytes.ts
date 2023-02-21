import { ZipData } from '../services/types';
import byteCountFromBase64 from './byteCountFromBase64';
import byteCountFromObject from './byteCountFromObject';

const calculateDownloadSize = (groupData: ZipData): number => {
  if (!groupData) {
    return 0;
  }

  const fileSize = groupData.items.reduce((fileSize, item) => {
    fileSize +=
      item.type === 'File'
        ? byteCountFromBase64(item.data as string)
        : byteCountFromObject(item.data as object);

    return fileSize;
  }, 0);

  return fileSize;
};

export default calculateDownloadSize;
