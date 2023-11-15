import PropTypes from 'prop-types';
// @mui
import { Grid } from '@mui/material';
import CategoryCard from './CategoryCard';
import { useState } from 'react';
// import ProductModal from '../../../Reuseable/Product/ProductModal';

// ----------------------------------------------------------------------

CategoryList.propTypes = {
  categories: PropTypes.array.isRequired,
};

export default function CategoryList({ categories, setShowModal,showModal ,getBook,...other }) {
  // const [book,setBook]=useState()

  console.log("category",showModal)

  return (
    <Grid container spacing={3} {...other}>
      {categories.map((category) => (
        
        <Grid key={category.id} item xs={12} sm={6} md={3}>
          {/* {()=>{getBook(category)}} */}
          <CategoryCard category={category} setShowModal={setShowModal} showModal={showModal} getBook={getBook} />
          {/* <ProductModal /> */}
        </Grid>
      ))}
    </Grid>
  );
}
