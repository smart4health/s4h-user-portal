import { Attachment } from '@d4l/js-sdk';
import determineFilenameForFileGroupItem from '../determineFilenameForAttachment';

describe('determineFilenameForAttachment', () => {
  describe('when there is a title', () => {
    const fakeAttachment: Attachment = {
      file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABaIAAARQCAYAAAAf',
      id: '952d29b1-aab3-4900-bc07-7b1b326a3a5b',
      contentType: 'image/png',
      title: 'document title.png',
    };

    it('concatenates "Document" prefix, attachment id and title in that order', () => {
      const fileName = determineFilenameForFileGroupItem(fakeAttachment);
      expect(fileName).toBe(
        'Document 952d29b1-aab3-4900-bc07-7b1b326a3a5b document title.png'
      );
    });
  });

  describe('when there is no title', () => {
    const fakeAttachment: Attachment = {
      file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABaIAAARQCAYAAAAf',
      id: '952d29b1-aab3-4900-bc07-7b1b326a3a5b',
      contentType: 'image/png',
    };

    it('concatenates "Document" prefix and attachment id in that order', () => {
      const fileName = determineFilenameForFileGroupItem(fakeAttachment);
      expect(fileName).toBe('Document 952d29b1-aab3-4900-bc07-7b1b326a3a5b.png');
    });

    describe('and there is no content type', () => {
      const fakeAttachment: Attachment = {
        file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABaIAAARQCAYAAAAf',
        id: '952d29b1-aab3-4900-bc07-7b1b326a3a5b',
      };

      it('uses the data URL string prefix to determine the file extension', () => {
        const fileName = determineFilenameForFileGroupItem(fakeAttachment);
        expect(fileName).toBe('Document 952d29b1-aab3-4900-bc07-7b1b326a3a5b.png');
      });
    });
  });

  describe('when title contains a file extension', () => {
    describe('and there is no content type', () => {
      const fakeAttachment: Attachment = {
        file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABaIAAARQCAYAAAAf',
        id: '952d29b1-aab3-4900-bc07-7b1b326a3a5b',
        title: 'document title.png',
      };

      it('uses the extension from the title', () => {
        const fileName = determineFilenameForFileGroupItem(fakeAttachment);
        expect(fileName).toBe(
          'Document 952d29b1-aab3-4900-bc07-7b1b326a3a5b document title.png'
        );
      });
    });

    describe('and there is a content type which matches the file extension in the title', () => {
      const fakeAttachment: Attachment = {
        file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABaIAAARQCAYAAAAf',
        id: '952d29b1-aab3-4900-bc07-7b1b326a3a5b',
        contentType: 'image/png',
        title: 'document title.png',
      };

      it('uses the extension from the title / content type', () => {
        const fileName = determineFilenameForFileGroupItem(fakeAttachment);
        expect(fileName).toBe(
          'Document 952d29b1-aab3-4900-bc07-7b1b326a3a5b document title.png'
        );
      });
    });

    describe('and there is a content type which does not match the file extension in the title', () => {
      const fakeAttachment: Attachment = {
        file: 'data:application/pdf;base64,iVBORw0KGgoAAAANSUhEUgAABaIAAARQCAYAAAAf',
        id: '952d29b1-aab3-4900-bc07-7b1b326a3a5b',
        contentType: 'application/pdf',
        title: 'document title.png',
      };

      it('derives the extension from the content type', () => {
        const fileName = determineFilenameForFileGroupItem(fakeAttachment);
        expect(fileName).toBe(
          'Document 952d29b1-aab3-4900-bc07-7b1b326a3a5b document title.pdf'
        );
      });
    });
  });

  describe('when title does not contain a file extension', () => {
    describe('and there is no content type', () => {
      const fakeAttachment: Attachment = {
        file: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAABaIAAARQCAYAAAAf',
        id: '952d29b1-aab3-4900-bc07-7b1b326a3a5b',
        title: 'document title',
      };

      it('uses the data URL string prefix to determine the file extension', () => {
        const fileName = determineFilenameForFileGroupItem(fakeAttachment);
        expect(fileName).toBe(
          'Document 952d29b1-aab3-4900-bc07-7b1b326a3a5b document title.jpeg'
        );
      });
    });

    describe('and there is a content type', () => {
      const fakeAttachment: Attachment = {
        file: 'data:application/pdf;base64,iVBORw0KGgoAAAANSUhEUgAABaIAAARQCAYAAAAf',
        id: '952d29b1-aab3-4900-bc07-7b1b326a3a5b',
        contentType: 'application/pdf',
        title: 'document title',
      };
      it('derives the extension from the content type', () => {
        const fileName = determineFilenameForFileGroupItem(fakeAttachment);
        expect(fileName).toBe(
          'Document 952d29b1-aab3-4900-bc07-7b1b326a3a5b document title.pdf'
        );
      });
    });
  });
});
