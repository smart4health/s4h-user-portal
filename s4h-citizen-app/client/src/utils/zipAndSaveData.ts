import FileSaver from 'file-saver';
import JSZip from 'jszip';
import { ZipData } from '../services/types';

export default async function zipAndSaveData(zipData: ZipData) {
  const zip = new JSZip();

  zipData.items.forEach(item => {
    switch (item.type) {
      case 'File':
        zip.file(item.filename, (item.data as string).split(',')[1], {
          base64: true,
        });
        break;
      case 'JSON':
        zip.file(
          item.filename,
          new Blob([JSON.stringify(item.data)], {
            type: 'text/plain',
          })
        );
        break;
      default:
        console.debug(
          `Unsupported item type "${item.type}" found. Skipping it in the zipping process.`
        );
        break;
    }
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  FileSaver.saveAs(blob, `${zipData.filename}.zip`);
}
