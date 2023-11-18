import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
// @mui
import { Container, Stack, Typography } from '@mui/material';
// components
import { CategorySort, CategoryList, CategoryCartWidget, CategoryFilterSidebar } from '../sections/@dashboard/products';
// mock
import PRODUCTS from '../_mock/products';
import classes from './CategoriesPage.module.css';
import { db } from '../services/firebase';
import CategoriesModal from '../Reuseable/Modal/CategoriesModal';

// ----------------------------------------------------------------------

export default function CategoriesPage() {
  const [openFilter, setOpenFilter] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [categoryData, setCategoryData] = useState(null);
  const [book, setBook] = useState();

  const getBook = (book) => {
    setBook(book);
  };
  console.log('getbook', book);

  const handleModal = () => {
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setCategoryData(null);
  };
  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  useEffect(() => {
    const getCategories = () => {
      const booksRef = collection(db, 'books');
      getDocs(booksRef)
        .then((snapshot) => {
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          setCategories(docs);
        })
        .catch((error) => {
          console.log('Error getting categories:', error);
        });
    };

    getCategories();
  }, []);

  return (
    <>
      <Helmet>
        <title> Agan-Adhigaram-admin | Books </title>
      </Helmet>

      <Container>
        <div className={classes.categoryHeader}>
          <Typography variant="h4">Books Management</Typography>
          <Button variant="contained" onClick={handleModal} className={classes.categoryBtn}>
            Add Book
          </Button>
          {showModal && (
            <CategoriesModal
              categories={categories}
              setCategories={setCategories}
              open={handleModal}
              close={closeModal}
              book={book}
              showModal={showModal}
              getBook={getBook}
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
        <CategoryList categories={categories} setShowModal={setShowModal} getBook={getBook} showModal={showModal} />

        {/* <ProductCartWidget /> */}
      </Container>
    </>
  );
}
