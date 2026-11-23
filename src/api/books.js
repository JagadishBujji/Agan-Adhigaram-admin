import { arrayRemove, collection, deleteDoc, doc, getDocFromServer, getDocsFromServer, updateDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { db, storage } from 'src/services/firebase';
import { deleteBook } from 'src/utils/deleteBook';

// Deletes a book, its images and its "related books" links (see utils/deleteBook)
// Reads come from the server only: offline, getDocs answers from the local cache
// (possibly empty), which would make an ordered book look never ordered.
const deleteBookWithImages = (book) =>
  deleteBook(book, {
    isAvailableNow: async (bookId) => (await getDocFromServer(doc(db, 'books', bookId))).data()?.is_available !== false,
    hideBook: (bookId) => updateDoc(doc(db, 'books', bookId), { is_available: false }),
    restoreBook: (bookId) => updateDoc(doc(db, 'books', bookId), { is_available: true }),
    loadOrders: async () => (await getDocsFromServer(collection(db, 'orders'))).docs.map((d) => d.data()),
    loadBooks: async () => (await getDocsFromServer(collection(db, 'books'))).docs.map((d) => ({ id: d.id, ...d.data() })),
    removeRelated: (otherId, bookId) => updateDoc(doc(db, 'books', otherId), { related_books: arrayRemove(bookId) }),
    deleteBookDoc: (bookId) => deleteDoc(doc(db, 'books', bookId)),
    deleteFile: (path) => deleteObject(ref(storage, path)),
  });

export { deleteBookWithImages };
