import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Box, Card, Link, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
// utils
import { fCurrency } from '../../../utils/formatNumber';
// components
import Label from '../../../components/label';
import { ColorPreview } from '../../../components/color-utils';
import EditIcon from '@mui/icons-material/Edit';
// import ProductModal from 'src/Reuseable/Product/ProductModal';
import classes from './CategoryCard.module.css';
import CategoriesModal from 'src/Reuseable/Modal/CategoriesModal';
import MenuIcon from 'src/Reuseable/MenuIcon/MenuIcon';

// ----------------------------------------------------------------------

const StyledProductImg = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
});

// ----------------------------------------------------------------------

CategoryCard.propTypes = {
  category: PropTypes.object,
};

export default function CategoryCard({ category, setShowModal }) {
  const { id, name, cover, price, colors, status, priceSale } = category;
  const navigate = useNavigate();
  return (
    <Card
      sx={{ cursor: 'pointer', height: '100%' }}
      // onClick={() => {
      //   navigate(`/dashboard/categories/${id}/products`);
      // }}
    >
      <Box sx={{ pt: '100%', position: 'relative' }}>
        <Label
          variant="filled"
          // color={(status === 'sale' && 'error') || 'info'}
          color={'info'}
          sx={{
            zIndex: 9,
            top: 16,
            right: 16,
            position: 'absolute',
            textTransform: 'uppercase',
          }}
        >
          Order No: {category.orderNo}
        </Label>
        <StyledProductImg alt={name} src={category.imgUrl} />
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover">
          <div className={classes.cardHeader}>
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
            <MenuIcon item={category} editItem={() => setShowModal(category)} type="category" />
          </div>
        </Link>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {/* <ColorPreview colors={colors} /> */}
          <Typography variant="subtitle1">
            <Typography
              component="span"
              variant="body1"
              sx={{
                color: 'text.disabled',
                // textDecoration: 'line-through',
              }}
            >
              {/* {priceSale && fCurrency(priceSale)} */}Delivery Msg:
            </Typography>
            &nbsp;
            {/* {fCurrency(price)} */}
            {category.deliveryMsg}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
