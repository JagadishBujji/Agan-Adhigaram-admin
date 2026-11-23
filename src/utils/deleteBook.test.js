/* eslint-env jest */
import { storagePathFromUrl, planBookDeletion, deleteBook } from './deleteBook';

const url = (path) =>
  `https://firebasestorage.googleapis.com/v0/b/agan-adhigaram.appspot.com/o/${encodeURIComponent(path)}?alt=media&token=t`;

const testBook = {
  id: 'b1',
  title: 'TEST',
  images: [url('images/books/TEST-1/a.png'), url('images/books/TEST-1/b.png')],
};
const otherBook = { id: 'b2', images: [url('images/books/Other-1/a.png')], related_books: ['b1', 'b3'] };
const books = [testBook, otherBook];

describe('storagePathFromUrl', () => {
  it('reads the file path of a book image link', () => {
    expect(storagePathFromUrl(testBook.images[0])).toBe('images/books/TEST-1/a.png');
  });

  it('reads emulator links the same way', () => {
    expect(
      storagePathFromUrl('http://127.0.0.1:9199/v0/b/agan-adhigaram.appspot.com/o/images%2Fbooks%2FX%2Fa.png?alt=media')
    ).toBe('images/books/X/a.png');
  });

  it('ignores links that are not book images in our storage', () => {
    expect(storagePathFromUrl('https://example.com/a.png')).toBeNull();
    expect(storagePathFromUrl(url('banners/home.png'))).toBeNull();
    expect(storagePathFromUrl(undefined)).toBeNull();
  });
});

describe('planBookDeletion', () => {
  it('refuses a book that is in an order (its picture shows in order history)', () => {
    const orders = [{ ordered_books: [{ id: 'b9' }] }, { ordered_books: [{ id: 'b1' }, { id: 'b2' }] }];
    expect(planBookDeletion(testBook, books, orders)).toEqual({ blocked: true, orderCount: 1 });
  });

  it('removes its images and its links from other books', () => {
    expect(planBookDeletion(testBook, books, [])).toEqual({
      blocked: false,
      imagePaths: ['images/books/TEST-1/a.png', 'images/books/TEST-1/b.png'],
      linkedFrom: ['b2'],
    });
  });

  it('keeps an image another book also uses, even through a different link', () => {
    const sameFileOtherToken = testBook.images[1].replace('token=t', 'token=other');
    const sharing = { id: 'b3', images: [sameFileOtherToken] };
    expect(planBookDeletion(testBook, [...books, sharing], []).imagePaths).toEqual(['images/books/TEST-1/a.png']);
  });
});

describe('deleteBook', () => {
  const steps = () => {
    const log = [];
    return {
      log,
      isAvailableNow: jest.fn(async () => true),
      hideBook: jest.fn(async (id) => log.push(`hide ${id}`)),
      restoreBook: jest.fn(async (id) => log.push(`restore ${id}`)),
      loadOrders: jest.fn(async () => {
        log.push('check orders');
        return [];
      }),
      removeRelated: jest.fn(async (id) => log.push(`unlink ${id}`)),
      deleteBookDoc: jest.fn(async (id) => log.push(`delete ${id}`)),
      deleteFile: jest.fn(async (path) => log.push(`file ${path}`)),
    };
  };

  it('hides the book before checking orders, then unlinks, deletes it and its images', async () => {
    const s = steps();
    const result = await deleteBook(testBook, books, s);
    expect(result).toEqual({ deleted: true, imagesDeleted: 2, imagesFailed: 0 });
    expect(s.log).toEqual([
      'hide b1',
      'check orders',
      'unlink b2',
      'delete b1',
      'file images/books/TEST-1/a.png',
      'file images/books/TEST-1/b.png',
    ]);
  });

  it('puts an ordered book back as it was and deletes nothing', async () => {
    const s = steps();
    s.loadOrders.mockResolvedValue([{ ordered_books: [{ id: 'b1' }] }]);
    expect(await deleteBook(testBook, books, s)).toEqual({ deleted: false, orderCount: 1 });
    expect(s.log).toEqual(['hide b1', 'restore b1']);
  });

  it('puts the book back on sale when a step fails before it is deleted', async () => {
    for (const failing of ['hideBook', 'loadOrders', 'removeRelated', 'deleteBookDoc']) {
      const s = steps();
      s[failing].mockRejectedValueOnce(new Error('network'));
      await expect(deleteBook(testBook, books, s)).rejects.toThrow('network');
      expect(s.restoreBook).toHaveBeenCalledWith('b1');
    }
  });

  it('leaves a book hidden when it was hidden in the database, whatever the page showed', async () => {
    const s = steps();
    s.isAvailableNow.mockResolvedValue(false); // another admin hid it after this page loaded
    s.loadOrders.mockResolvedValue([{ ordered_books: [{ id: 'b1' }] }]);
    await deleteBook({ ...testBook, is_available: true }, books, s);
    expect(s.hideBook).not.toHaveBeenCalled();
    expect(s.restoreBook).not.toHaveBeenCalled();
  });

  it('reports images that could not be removed, the book is still deleted', async () => {
    const s = steps();
    s.deleteFile.mockRejectedValueOnce(new Error('denied'));
    expect(await deleteBook(testBook, books, s)).toEqual({ deleted: true, imagesDeleted: 1, imagesFailed: 1 });
  });
});
