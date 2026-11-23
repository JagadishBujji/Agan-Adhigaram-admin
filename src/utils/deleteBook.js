// Deleting a book from the dashboard: the book, its images in storage, and its
// place in other books' "related books" (the website would fail to show those).
// A book that was ever ordered is not deleted: customers' order history shows
// its picture from these image files. Hide it instead (untick "Available").
// The book is hidden before the orders are checked: the website writes an order
// before starting payment, and the payment server refuses hidden books, so no
// paid order can contain the book without being seen by the check.

const BOOK_IMAGES = 'images/books/';

// "https://firebasestorage.googleapis.com/v0/b/<bucket>/o/images%2Fbooks%2F...?alt=media"
// (or the emulator's http://127.0.0.1:9199/v0/b/...) -> "images/books/...",
// or null for anything that is not one of our book images
export function storagePathFromUrl(url) {
  if (typeof url !== 'string') return null;
  const match = url.match(/^https?:\/\/[^/]+\/v0\/b\/[^/]+\/o\/([^?]+)/);
  if (!match) return null;
  const path = decodeURIComponent(match[1]);
  return path.startsWith(BOOK_IMAGES) ? path : null;
}

// books: all books (to keep images another book also uses), orders: all orders
export function planBookDeletion(book, books, orders) {
  const orderCount = orders.filter((order) =>
    (order.ordered_books || []).some((item) => item.id === book.id)
  ).length;
  if (orderCount > 0) return { blocked: true, orderCount };

  const others = books.filter((other) => other.id !== book.id);
  // compared by file, not link: two links (other token) can point to one file
  const usedElsewhere = new Set(others.flatMap((other) => (other.images || []).map(storagePathFromUrl)));
  const imagePaths = [
    ...new Set((book.images || []).map(storagePathFromUrl).filter((path) => path && !usedElsewhere.has(path))),
  ];
  const linkedFrom = others.filter((other) => (other.related_books || []).includes(book.id)).map((other) => other.id);

  return { blocked: false, imagePaths, linkedFrom };
}

// steps: { isAvailableNow(bookId), hideBook(bookId), restoreBook(bookId), loadOrders, loadBooks,
//          removeRelated(otherBookId, bookId), deleteBookDoc(bookId), deleteFile(path) }
// Everything is read from the database when the delete starts, not taken from
// the page: another admin may have changed books since it loaded.
// Order matters: hide, check orders, links (a link to a missing book breaks a
// page), the book, then the images (a leftover image file harms nothing).
export async function deleteBook(
  book,
  { isAvailableNow, hideBook, restoreBook, loadOrders, loadBooks, removeRelated, deleteBookDoc, deleteFile }
) {
  // read from the database, not the page: another admin may have hidden it since
  const wasAvailable = await isAvailableNow(book.id);

  // until the book itself is deleted, any refusal or failure (the hide included)
  // puts it back on sale - only if it was on sale before
  let plan;
  try {
    if (wasAvailable) await hideBook(book.id);
    const orders = await loadOrders();
    const books = await loadBooks();
    plan = planBookDeletion(book, books, orders);
    if (!plan.blocked) {
      for (const otherId of plan.linkedFrom) {
        await removeRelated(otherId, book.id);
      }
      await deleteBookDoc(book.id);
    }
  } catch (e) {
    if (wasAvailable) await restoreBook(book.id).catch(() => {});
    throw e;
  }
  if (plan.blocked) {
    if (wasAvailable) await restoreBook(book.id);
    return { deleted: false, orderCount: plan.orderCount };
  }

  let imagesDeleted = 0;
  let imagesFailed = 0;
  for (const path of plan.imagePaths) {
    try {
      await deleteFile(path);
      imagesDeleted += 1;
    } catch (e) {
      imagesFailed += 1;
    }
  }
  return { deleted: true, imagesDeleted, imagesFailed };
}
