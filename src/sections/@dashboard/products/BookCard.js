import PropTypes from 'prop-types';
// @mui
import { Box, Card, Link, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

import classes from './BookCard.module.css';
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

BookCard.propTypes = {
  category: PropTypes.object,
};

export default function BookCard({ book, setShowModal, setBookHandler }) {
  // const navigate = useNavigate();
  const { id, title, author, genre, discount_price, mrp_price, stock ,title_tamil} = book;
  // console.log('books stuff', book);

  return (
    <Card
      sx={{ cursor: 'pointer', height: '100%' }}
      // onClick={() => {
      //   navigate(`/dashboard/categories/${id}/products`);
      // }}
    >
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {/* <Label
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
        </Label> */}
        <StyledProductImg alt={name} src={book?.images[0]} />
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover">
          <Typography className={classes.humorous} variant="subtitle2" noWrap>
            {genre}
          </Typography>
          <div className={classes.cardHeader}>
            <Typography variant="subtitle2" noWrap>
              {title}({title_tamil})
            </Typography>

            <MenuIcon item={book} type="category" setShowModal={setShowModal} setBookHandler={setBookHandler} />
          </div>

          <Typography className={classes.namecard} variant="subtitle2" noWrap>
            {author}
          </Typography>
        </Link>
        <Stack direction="row" alignItems="center">
          {/* <ColorPreview colors={colors} /> */}
          <Typography variant="subtitle1">
            ₹ {discount_price}
            <span className={classes.stricksamount}>₹ {mrp_price}</span>
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center">
          Stock: {stock}
        </Stack>
      </Stack>
    </Card>
  );
}
