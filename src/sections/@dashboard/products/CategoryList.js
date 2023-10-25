import PropTypes from 'prop-types';
// @mui
import { Grid } from '@mui/material';
import CategoryCard from './CategoryCard';
// import ProductModal from '../../../Reuseable/Product/ProductModal';

// ----------------------------------------------------------------------

CategoryList.propTypes = {
  categories: PropTypes.array.isRequired,
};

export default function CategoryList({ categories, setShowModal, ...other }) {
  return (
    <Grid container spacing={3} {...other}>
      {categories.map((category) => (
        <Grid key={category.id} item xs={12} sm={6} md={3}>
          <CategoryCard category={category} setShowModal={setShowModal} />
          {/* <ProductModal /> */}
        </Grid>
      ))}
    </Grid>
  );
}
