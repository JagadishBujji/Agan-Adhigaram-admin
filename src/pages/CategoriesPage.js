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
    getCategories();
  }, []);

  const getCategories = () => {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('orderNo'));
    getDocs(q)
      .then((querySnapshot) => {
        const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log('getCategories:', docs);
        setCategories(docs);
      })
      .catch((error) => {
        console.log('Error getting categories:', error);
      });
  };

  return (
    <>
      <Helmet>
        <title> Agan-Adhigaram-admin | Books  </title>
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
              categoryData={categoryData}
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
        <CategoryList
          categories={categories}
          setShowModal={(category) => {
            setShowModal(true);
            setCategoryData(category);
          }}
        />
        {/* <ProductCartWidget /> */}
      </Container>
    </>
  );
}
