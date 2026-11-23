import { arrayRemove, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { db, storage } from 'src/services/firebase';
import { deleteBook } from 'src/utils/deleteBook';

// Deletes a book, its images and its "related books" links (see utils/deleteBook)
const deleteBookWithImages = (book, books) =>
  deleteBook(book, books, {
    hideBook: (bookId) => updateDoc(doc(db, 'books', bookId), { is_available: false }),
    restoreBook: (bookId) => updateDoc(doc(db, 'books', bookId), { is_available: true }),
    loadOrders: async () => (await getDocs(collection(db, 'orders'))).docs.map((d) => d.data()),
    removeRelated: (otherId, bookId) => updateDoc(doc(db, 'books', otherId), { related_books: arrayRemove(bookId) }),
    deleteBookDoc: (bookId) => deleteDoc(doc(db, 'books', bookId)),
    deleteFile: (path) => deleteObject(ref(storage, path)),
  });

export { deleteBookWithImages };
