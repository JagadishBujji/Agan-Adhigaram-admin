import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
// @mui
import { Container, Stack, Typography } from '@mui/material';
// components
import { BookList } from '../sections/@dashboard/products';
// mock
// import PRODUCTS from '../_mock/products';
import classes from './CategoriesPage.module.css';
import { db } from '../services/firebase';
import BookModal from '../Reuseable/Modal/BookModal';

// ----------------------------------------------------------------------

export default function BookManagement() {
  // const [openFilter, setOpenFilter] = useState(false);
  const [book, setBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);

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

  useEffect(() => {
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

    getBooks();
  }, []);

  const updateBooks = (newBook) => {
    setBooks((prevState) => [...prevState, newBook]);
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
            <BookModal showModal={showModal} closeModal={closeModal} book={book} updateBooks={updateBooks} />
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
        <BookList books={books} setShowModal={setShowModal} setBookHandler={setBookHandler} showModal={showModal} />

        {/* <ProductCartWidget /> */}
      </Container>
    </>
  );
}
