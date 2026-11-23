// Deleting a book from the dashboard: the book, its images in storage, and its
// place in other books' "related books" (the website would fail to show those).
// A book that was ever ordered is not deleted: customers' order history shows
// its picture from these image files. Hide it instead (untick "Available").

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
  const usedElsewhere = new Set(others.flatMap((other) => other.images || []));
  const imagePaths = [
    ...new Set(
      (book.images || []).filter((image) => !usedElsewhere.has(image)).map(storagePathFromUrl).filter(Boolean)
    ),
  ];
  const linkedFrom = others.filter((other) => (other.related_books || []).includes(book.id)).map((other) => other.id);

  return { blocked: false, imagePaths, linkedFrom };
}

// steps: { loadOrders, removeRelated(otherBookId, bookId), deleteBookDoc(bookId), deleteFile(path) }
// Order matters: links first (a link to a missing book breaks a page), then the
// book, then the images (a leftover image file harms nothing).
export async function deleteBook(book, books, { loadOrders, removeRelated, deleteBookDoc, deleteFile }) {
  const plan = planBookDeletion(book, books, await loadOrders());
  if (plan.blocked) return { deleted: false, orderCount: plan.orderCount };

  for (const otherId of plan.linkedFrom) {
    await removeRelated(otherId, book.id);
  }
  await deleteBookDoc(book.id);

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
