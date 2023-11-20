import { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Grid, TextareaAutosize, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import classes from './BookModal.module.css';
import { db } from '../../services/firebase';
import { isNumeric, isValidDate, isValidName } from '../../utils/validation';
import BasicSelect from '../Select/Select';
import { errorNotification, successNotification } from '../../utils/notification';
import UploadedImage from './UploadedImage';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../store/userSlice';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
  maxHeight: '500px',
  borderRadius: '20px',
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function BookModal({ showModal, closeModal, book, updateBooks }) {
  const dispatch = useDispatch();
  const [bookUpdated, setBookUpdated] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedfile, SetSelectedFile] = useState([]);

  useEffect(() => {
    const getGenreData = async () => {
      const docRef = doc(db, 'app', 'meta');
      const docSnap = await getDoc(docRef);
      const genreInfo = docSnap.data().genre;
      setGenres(genreInfo);
    };
    getGenreData();
  }, []);

  useEffect(() => {
    console.log('book: ', book);
    if (book) {
      setBookUpdated(book);
    }
  }, [book]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);
    setBookUpdated((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePublish = async () => {
    const bookRef = doc(db, 'books', book.id);
    const date = new Date(bookUpdated.date_published);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formatedDate = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
    const temp = {
      author: bookUpdated.author,
      book_format: bookUpdated.book_format,
      date_published: { formatedDate },
      description: bookUpdated.description,
      genre: bookUpdated.genre,
      illustrator: bookUpdated.illustrator,
      images: [
        'https://firebasestorage.googleapis.com/v0/b/agan-adhigaram.appspot.com/o/vadai.png?alt=media',
        ' https://firebasestorage.googleapis.com/v0/b/agan-adhigaram.appspot.com/o/vadaibook.png?alt=media',
        'https://firebasestorage.googleapis.com/v0/b/agan-adhigaram.appspot.com/o/smallvadibook.svg?alt=media',
        'https://firebasestorage.googleapis.com/v0/b/agan-adhigaram.appspot.com/o/vadaileaf.svg?alt=media',
        'https://firebasestorage.googleapis.com/v0/b/agan-adhigaram.appspot.com/o/backvadipostion.svg?alt=media',
        'https://firebasestorage.googleapis.com/v0/b/agan-adhigaram.appspot.com/o/frontvadaipostion.svg?alt=media',
      ],
      language: bookUpdated.language,
      mrp_price: bookUpdated.mrp_price,
      pages: bookUpdated.pages,
      publisher: bookUpdated.publisher,
      reading_age: bookUpdated.reading_age,
      stock: bookUpdated.stock,
      title: bookUpdated.title,
      is_available: isChecked,
    };
    await updateDoc(bookRef, temp);
    closeModal();
    setIsChecked(false);
  };

  const handleSaveDraft = () => {
    dispatch(setLoading(true));
    console.log('images: ', selectedfile);
    const storage = getStorage();
    const storagePromises = [];
    const storageRefPromises = [];
    const timestamp = new Date().getTime();
    selectedfile.forEach((img) => {
      const storageRef = ref(storage, `/images/books/${bookUpdated.title}-${timestamp}/` + img.filename);
      storageRefPromises.push(storageRef);
      storagePromises.push(uploadBytes(storageRef, img.file));
    });
    Promise.all(storagePromises)
      .then((res) => {
        console.log('res: ', res);
        const downloadPromises = [];
        storageRefPromises.forEach((ref) => {
          downloadPromises.push(getDownloadURL(ref));
        });
        Promise.all(downloadPromises)
          .then((imgUrls) => {
            console.log('imgUrls: ', imgUrls);
            addDoc(collection(db, 'books'), {
              amazon_link: bookUpdated.amazon_link,
              author: bookUpdated.author,
              book_format: bookUpdated.book_format,
              book_id: '',
              date_published: new Date(bookUpdated.date_published).getTime(),
              description: bookUpdated.description,
              discount_percentage: ((bookUpdated.mrp_price - bookUpdated.discount_price) / bookUpdated.mrp_price) * 100,
              discount_price: bookUpdated.discount_price,
              genre: bookUpdated.genre,
              illustrator: bookUpdated.illustrator,
              images: [...imgUrls], // new urls from server
              language: bookUpdated.language,
              mrp_price: bookUpdated.mrp_price,
              pages: bookUpdated.pages,
              publisher: bookUpdated.publisher,
              reading_age: bookUpdated.reading_age,
              status: 'draft',
              stock: bookUpdated.stock,
              title: bookUpdated.title,
              is_available: isChecked,
            })
              .then(() => {
                updateBooks(bookUpdated);
                dispatch(setLoading(false));
                successNotification('Successfully stored new book!!!');
                closeModal();
              })
              .catch((e) => {
                console.log(e);
                dispatch(setLoading(false));
                errorNotification(e.message);
              });
          })
          .catch((e) => {
            console.log(e);
            dispatch(setLoading(false));
            errorNotification(e.message);
          });
      })
      .catch((e) => {
        console.log(e);
        dispatch(setLoading(false));
        errorNotification(e.message);
      });
  };

  const saveHandler = () => {
    // console.log('bookUpdated', bookUpdated);
    !isValidName(bookUpdated.genre)
      ? errorNotification('Invalid Genre')
      : !isValidName(bookUpdated.title)
      ? errorNotification('Invalid Book Name')
      : !isValidName(bookUpdated.author)
      ? errorNotification('Invalid Author Name')
      : !isNumeric(bookUpdated.mrp_price)
      ? errorNotification('Invalid Price')
      : !isNumeric(bookUpdated.discount_price)
      ? errorNotification('Invalid Discounted Price')
      : !isNumeric(bookUpdated.stock)
      ? errorNotification('Invalid Stock')
      : !isValidName(bookUpdated.description)
      ? errorNotification('Invalid Book Description')
      : !isValidName(bookUpdated.illustrator)
      ? errorNotification('Invalid Illustrator Name')
      : !isValidName(bookUpdated.language)
      ? errorNotification('Invalid Edition Language')
      : !isValidName(bookUpdated.book_format)
      ? errorNotification('Invalid Book Format')
      : !isValidDate(bookUpdated.date_published)
      ? errorNotification('Invalid Published Date')
      : !isValidName(bookUpdated.publisher)
      ? errorNotification('Invalid Published Name')
      : !isNumeric(bookUpdated.pages)
      ? errorNotification('Invalid Pages')
      : bookUpdated.reading_age === ''
      ? errorNotification('Invalid Reading Age')
      : // : images.length === 0
      // ? errorNotification('Images are mandatory, please choose 6 images & upload it')
      selectedfile.length < 6
      ? errorNotification('Images are mandatory, please choose/upload 6 images')
      : handleSaveDraft();
  };

  return (
    <div>
      <Modal
        open={showModal}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Grid container spacing={2}>
            <Grid item md={6}>
              <form>
                <Grid container spacing={2}>
                  <Typography variant="h4">Book Details</Typography>
                  <Grid item xs={6}>
                    <BasicSelect
                      label="Genres List Type"
                      name="genre"
                      // values={[
                      //   { displayName: 'All Genres', value: 'All Genres' },
                      //   { displayName: 'Humorous', value: 'horror' },
                      //   { displayName: 'Cultural', value: 'Cultural' },
                      //   { displayName: 'Adventure', value: 'Adventure' },
                      // ]}
                      values={genres}
                      value={bookUpdated.genre}
                      onChange={onChangeHandler}
                      required
                    />
                  </Grid>
                  <Grid item md={6}>
                    <Item>
                      <TextField
                        fullWidth
                        label="Book Name"
                        variant="outlined"
                        name="title"
                        onChange={onChangeHandler}
                        value={bookUpdated.title}
                        required
                      />
                    </Item>
                  </Grid>
                  <Grid item md={6}>
                    <Item>
                      <TextField
                        fullWidth
                        label="Author Name"
                        variant="outlined"
                        name="author"
                        type="text"
                        onChange={onChangeHandler}
                        value={bookUpdated.author}
                        required
                      />
                    </Item>
                  </Grid>
                  <Grid item md={6}>
                    <Item>
                      <TextField
                        fullWidth
                        label="Price"
                        variant="outlined"
                        name="mrp_price"
                        type="text"
                        onChange={onChangeHandler}
                        value={bookUpdated.mrp_price}
                        required
                      />
                    </Item>
                  </Grid>
                  <Grid item md={6}>
                    <Item>
                      <TextField
                        fullWidth
                        label="Discounted Price"
                        variant="outlined"
                        name="discount_price"
                        type="text"
                        onChange={onChangeHandler}
                        value={bookUpdated.discount_price}
                        required
                      />
                    </Item>
                  </Grid>
                  <Grid item md={6}>
                    <Item>
                      <TextField
                        fullWidth
                        label="Stock No"
                        variant="outlined"
                        inputProps={{ type: 'number' }}
                        name="stock"
                        onChange={onChangeHandler}
                        value={bookUpdated.stock}
                        required
                      />
                    </Item>
                  </Grid>
                  <Grid item md={6}>
                    <Typography
                      sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}
                    >
                      <Checkbox
                        name="is_available"
                        inputProps={{ 'aria-label': 'Checkbox demo' }}
                        onClick={() => {
                          setIsChecked(!isChecked);
                        }}
                        checked={isChecked}
                      />
                      Available
                    </Typography>
                  </Grid>
                  <Grid item md={12}>
                    <Item>
                      <TextField
                        fullWidth
                        label="Description"
                        variant="outlined"
                        name="description"
                        type="text"
                        onChange={onChangeHandler}
                        value={bookUpdated.description}
                        required
                      />
                    </Item>
                  </Grid>
                </Grid>
              </form>
            </Grid>
            <Grid item md={6}>
              {/* <Typography variant="h4" className={classes.booktitle}>
                Book Details
              </Typography> */}
              <Grid container spacing={2}>
                {/* <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Author"
                    variant="outlined"
                    name="author"
                    onChange={onChangeHandler}
                    value={bookUpdated.author}
                  />
                </Grid> */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Illustrator"
                    variant="outlined"
                    name="illustrator"
                    onChange={onChangeHandler}
                    value={bookUpdated.illustrator}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Edition Language"
                    variant="outlined"
                    name="language"
                    onChange={onChangeHandler}
                    value={bookUpdated.language}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Book Format"
                    variant="outlined"
                    name="book_format"
                    onChange={onChangeHandler}
                    value={bookUpdated.book_format}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Published Date"
                    variant="outlined"
                    name="date_published"
                    onChange={onChangeHandler}
                    value={bookUpdated.date_published}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Publisher"
                    variant="outlined"
                    name="publisher"
                    onChange={onChangeHandler}
                    value={bookUpdated.publisher}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Pages"
                    variant="outlined"
                    name="pages"
                    type="pages"
                    onChange={onChangeHandler}
                    value={bookUpdated.pages}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Reading Age"
                    variant="outlined"
                    name="reading_age"
                    onChange={onChangeHandler}
                    value={bookUpdated.reading_age}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Amazon Link"
                    variant="outlined"
                    name="amazon_link"
                    onChange={onChangeHandler}
                    value={bookUpdated.amazon_link}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              {/* <bookUpdatedUpload onChangeHandler={onChangeHandler} bookUpdated={bookUpdated} type="bookUpdated" /> */}
              {/* <Upload/> */}
              <UploadedImage selectedfile={selectedfile} SetSelectedFile={SetSelectedFile} />
            </Grid>
          </Grid>
          <div className={classes.uploadBtns}>
            <Button
              variant="contained"
              sx={{
                background: '#F19E38',
                color: '#fff',
                transition: '1s',
                '&: hover': {
                  background: '#F19E38',
                  color: '#fff',
                  transition: '1s',
                },
              }}
              onClick={saveHandler}
            >
              Save as Draft
            </Button>
            {book && (
              <Button
                variant="contained"
                sx={{
                  background: '#F19E38',
                  color: '#fff',
                  transition: '1s',
                  '&: hover': {
                    background: '#F19E38',
                    color: '#fff',
                    transition: '1s',
                  },
                }}
                onClick={handlePublish}
              >
                Publish
              </Button>
            )}

            <Button variant="outlined" className={classes.uploadCancelBtn} onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
