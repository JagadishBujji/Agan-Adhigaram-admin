import PropTypes from 'prop-types';
// @mui
import { Grid } from '@mui/material';
import BookCard from './BookCard';

// ----------------------------------------------------------------------

BookList.propTypes = {
  categories: PropTypes.array.isRequired,
  books: PropTypes.object,
  onDelete: PropTypes.func,
};

export default function BookList({ books, setShowModal, setBookHandler, onDelete, ...other }) {
  return (
    <Grid container spacing={3} {...other}>
      {books?.map((book) => (
        <Grid key={book.id} item xs={12} sm={6} md={3}>
          <BookCard book={book} setShowModal={setShowModal} setBookHandler={setBookHandler} onDelete={onDelete} />
        </Grid>
      ))}
    </Grid>
  );
}
