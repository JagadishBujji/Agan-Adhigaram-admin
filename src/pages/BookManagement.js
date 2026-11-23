import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
// @mui
import {
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
// components
import { BookList } from '../sections/@dashboard/products';
// mock
// import PRODUCTS from '../_mock/products';
import classes from './CategoriesPage.module.css';
import { db } from '../services/firebase';
import BookModal from '../Reuseable/Modal/BookModal';
import { deleteBookWithImages } from '../api/books';
import { errorNotification, successNotification } from '../utils/notification';

// ----------------------------------------------------------------------

export default function BookManagement() {
  // const [openFilter, setOpenFilter] = useState(false);
  const [book, setBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const setBookHandler = (book) => {
    setBook(book);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setBook(null);
  };
  // const handleOpenFilter = () => {
  //   setOpenFilter(true);
  // };

  // const handleCloseFilter = () => {
  //   setOpenFilter(false);
  // };

  const getBooks = () => {
    const booksRef = collection(db, 'books');
    getDocs(booksRef)
      .then((snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        setBooks(docs);
      })
      .catch((error) => {
        console.log('Error getting categories:', error);
      });
  };

  useEffect(() => {
    getBooks();
  }, []);

  const updateBooks = (newBook) => {
    setBooks((prevState) => {
      const arr = [...prevState];
      const index = arr.findIndex((book) => book.id === newBook.id);
      if (index === -1) {
        return [...arr, newBook];
      } else {
        arr[index] = newBook;
        return [...arr];
      }
    });
  };

  const confirmDelete = async () => {
    const target = bookToDelete;
    setDeleting(true);
    try {
      const result = await deleteBookWithImages(target);
      if (!result.deleted) {
        errorNotification(
          `"${target.title}" is in ${result.orderCount} order(s), so it can't be deleted (customers see its picture in their orders). Untick "Available" to hide it instead.`
        );
      } else {
        if (result.imagesFailed > 0) {
          errorNotification(`"${target.title}" deleted, but ${result.imagesFailed} image(s) could not be removed.`);
        } else {
          successNotification(`"${target.title}" deleted, with ${result.imagesDeleted} image(s).`);
        }
      }
    } catch (e) {
      console.log('delete book error:', e);
      errorNotification(
        `Could not delete "${target.title}". Please try again. If it no longer shows on the shop, edit it and tick "Available".`
      );
    } finally {
      setDeleting(false);
      setBookToDelete(null);
      // reload from the database: the delete may have changed other books (related
      // links) or this book's availability, and this page's copies may be old
      getBooks();
    }
  };

  return (
    <>
      <Helmet>
        <title> Agan-Adhigaram-admin | Books </title>
      </Helmet>

      <Container>
        <div className={classes.categoryHeader}>
          <Typography variant="h4">Books Management</Typography>
          <Button variant="contained" onClick={openModal} className={classes.categoryBtn}>
            Add Book
          </Button>
          {showModal && (
            <BookModal
              books={books}
              showModal={showModal}
              closeModal={closeModal}
              book={book}
              updateBooks={updateBooks}
              setBookHandler={setBookHandler}
            />
          )}
        </div>

        {/* <Stack direction="row" flexWrap="wrap-reverse" alignItems="center" justifyContent="flex-end" sx={{ mb: 5 }}>
          <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
            <CategoryFilterSidebar
              openFilter={openFilter}
              onOpenFilter={handleOpenFilter}
              onCloseFilter={handleCloseFilter}
            />
            <CategorySort />
          </Stack>
        </Stack> */}

        {/* <ProductList products={PRODUCTS} /> */}
        <BookList
          books={books}
          setShowModal={setShowModal}
          setBookHandler={setBookHandler}
          showModal={showModal}
          onDelete={setBookToDelete}
        />

        <Dialog open={Boolean(bookToDelete)} onClose={() => !deleting && setBookToDelete(null)}>
          <DialogTitle>Delete this book?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              &quot;{bookToDelete?.title}&quot; will be deleted permanently, with its {bookToDelete?.images?.length || 0}{' '}
              images (a developer can restore images for 7 days). A book that is in any order can&apos;t be deleted:
              untick &quot;Available&quot; to hide it instead.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookToDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* <ProductCartWidget /> */}
      </Container>
    </>
  );
}
