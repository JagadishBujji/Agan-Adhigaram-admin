import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { collection, addDoc, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import Select from 'react-select';
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

export default function BookModal({ books, showModal, closeModal, book, updateBooks }) {
  const dispatch = useDispatch();
  const [bookUpdated, setBookUpdated] = useState({
    is_available: false,
    related_books: [],
  });
  const [genres, setGenres] = useState([]);
  const [selectedfile, SetSelectedFile] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [folderStorageName, setFolderStorageName] = useState('');



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
      const datePublished = new Date(book?.date_published);
      // Function to pad a number with leading zeros if it's a single digit
      const padNumber = (num) => num.toString().padStart(2, '0');
      // const relArr = [];
      // book.related_books.forEach((bk) => {
      //   books.forEach((book) => {
      //     if (bk === book.id) {
      //       relArr.push(book);
      //     }
      //   });
      // });
      const relArr = book.related_books
        .map((relatedBookId) => {
          const bookRelated = books.find((book) => book.id === relatedBookId);
          return {
            ...bookRelated,
            value: bookRelated.title,
            label: bookRelated.title + `(${bookRelated.title_tamil})`,
          };
        })
        .filter((relatedBook) => relatedBook);

      // console.log('relArry: ', relArr);
      const updatedBook = {
        ...book,
        date_published: `${datePublished.getFullYear()}-${padNumber(datePublished.getMonth() + 1)}-${padNumber(
          datePublished.getDate()
        )}`,
        related_books: relArr,
      };
      setBookUpdated(updatedBook);
      const updatedImages = book?.images?.map((img, i) => {
        const { bookName, folderName } = extractBookDetails(img);
        // console.log('folderName: ', folderName);
        setFolderStorageName(folderName);
        return {
          id: new Date().getTime() + i,
          filename: decodeURIComponent(bookName),
          filetype: '',
          fileimage: img,
          file: '',
          datetime: '',
          filesize: '',
          folderName,
        };
      });
      SetSelectedFile(updatedImages);
      // related books - here but without current book
      const relatedBooks =
        books
          ?.filter((bk) => bk.id !== book.id && bk.status === 'published' && bk.is_available === true)
          ?.map((book) => ({ ...book, value: book.title, label: book.title+ `(${book.title_tamil})` })) || [];
      setRelatedBooks(relatedBooks);
    } else {
      const relatedBooks =
        books
          ?.filter((bk) => bk.status === 'published' && bk.is_available === true)
          ?.map((book) => ({ ...book, value: book.title, label: book.title+ `(${book.title_tamil})` })) || [];
      setRelatedBooks(relatedBooks);
    }
  }, [book, books]);

  function extractBookDetails(url) {
    // Use a regular expression to extract the book name and folder name
    const regex = /\/images%2Fbooks%2F([^%]+)%2F([^?]+)\?/;

    // Match the regular expression against the URL
    const match = url.match(regex);

    // If there is a match, extract the book name and folder name
    if (match) {
      const folderName = match[1];
      const bookName = match[2];

      return { folderName, bookName };
    } else {
      // If no match is found, return an error or default values as needed
      return null;
    }
  }

  const onChangeHandler = (e) => {
    let { name, value } = e.target;
    // console.log(name, value, e.target.isChecked);
    if (name === 'is_available') {
      value = !bookUpdated.is_available;
    }
    setBookUpdated((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePublish = () => {
    dispatch(setLoading(true));
    console.log('publish: ', book, bookUpdated, selectedfile, deletedImages);
    const storage = getStorage();
    const storageRefPromises = [];
    const storageNewUrlPromises = [];
    // check images and push new ones and get urls, then add it to imgUrls then finish uploading
    const oldUrls = [];
    selectedfile.forEach((imgObj) => {
      if (imgObj.file === '' && imgObj.filesize === '' && imgObj.filetype === '' && imgObj.datetime === '') {
        oldUrls.push(imgObj.fileimage);
      } else {
        console.log('folderStorageName: ', folderStorageName);
        const storageRef = ref(storage, `/images/books/${folderStorageName}/` + imgObj.filename);
        storageRefPromises.push(storageRef);
        storageNewUrlPromises.push(uploadBytes(storageRef, imgObj.file));
      }
    });

    const deletePromises = [];
    deletedImages.forEach((delImg) => {
      const storageRef = ref(storage, `/images/books/${delImg.folderName}/` + delImg.filename);
      deletePromises.push(deleteObject(storageRef));
    });

    Promise.all(storageNewUrlPromises)
      .then(() => {
        const downloadPromises = [];
        storageRefPromises.forEach((ref) => {
          downloadPromises.push(getDownloadURL(ref));
        });
        Promise.all(downloadPromises)
          .then((imgUrls) => {
            const percentage = ((bookUpdated.mrp_price - bookUpdated.discount_price) / bookUpdated.mrp_price) * 100;
            const roundedPercentage = percentage.toFixed(2);

            const updatedDoc = {
              ...bookUpdated,
              amazon_link: bookUpdated.amazon_link,
              author: bookUpdated.author,
              book_format: bookUpdated.book_format,
              book_id: '',
              date_published: new Date(bookUpdated.date_published).getTime(),
              description: bookUpdated.description,
              discount_percentage: parseFloat(roundedPercentage),
              discount_price: parseFloat(bookUpdated.discount_price),
              genre: bookUpdated.genre,
              illustrator: bookUpdated.illustrator,
              images: [...oldUrls, ...imgUrls], // new urls from server
              language: bookUpdated.language,
              mrp_price: parseFloat(parseFloat(bookUpdated.mrp_price).toFixed(2)),
              pages: parseInt(bookUpdated.pages),
              publisher: bookUpdated.publisher,
              reading_age: bookUpdated.reading_age,
              status: 'published',
              stock: parseInt(bookUpdated.stock),
              title: bookUpdated.title,
              title_tamil:bookUpdated.title_tamil,
              is_available: bookUpdated.is_available,
              related_books: bookUpdated.related_books.map((book) => {
                const { value, label, id, ...rest } = book;
                return id;
              }),
            };
            setDoc(doc(db, 'books', book.id), updatedDoc)
              .then(() => {
                Promise.all(deletePromises)
                  .then(() => {
                    updateBooks(updatedDoc);
                    dispatch(setLoading(false));
                    successNotification('Successfully Updated!!!');
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
      })
      .catch((e) => {
        console.log(e);
        dispatch(setLoading(false));
        errorNotification(e.message);
      });
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
            const percentage = ((bookUpdated.mrp_price - bookUpdated.discount_price) / bookUpdated.mrp_price) * 100;
            const roundedPercentage = percentage.toFixed(2);
            addDoc(collection(db, 'books'), {
              amazon_link: bookUpdated.amazon_link,
              author: bookUpdated.author,
              book_format: bookUpdated.book_format,
              book_id: '',
              date_published: new Date(bookUpdated.date_published).getTime(),
              description: bookUpdated.description,
              discount_percentage: parseFloat(roundedPercentage),
              discount_price: parseFloat(bookUpdated.discount_price),
              genre: bookUpdated.genre,
              illustrator: bookUpdated.illustrator,
              images: [...imgUrls], // new urls from server
              language: bookUpdated.language,
              mrp_price: parseFloat(parseFloat(bookUpdated.mrp_price).toFixed(2)),
              pages: parseInt(bookUpdated.pages),
              publisher: bookUpdated.publisher,
              reading_age: bookUpdated.reading_age,
              status: 'draft',
              stock: parseInt(bookUpdated.stock),
              title: bookUpdated.title,
              title_tamil:bookUpdated.title_tamil,
              is_available: bookUpdated.is_available,
              related_books: bookUpdated.related_books.map((book) => {
                const { value, label, id, ...rest } = book;
                return id;
              }),
            })
              .then(() => {
                updateBooks({
                  ...bookUpdated,
                  images: [],
                });
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

  const saveHandler = (type) => {
  
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
      ? errorNotification('Invalid Book Description, should contain only letters')
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
      : type === 'draft'
      ? handleSaveDraft()
      : handlePublish();
  };

  // const handleUnPublish= async ()=>{
  //   const bookRef = doc(db, "books", book.id);
  //   const bookPublishDisable= await updateDoc(bookRef,{status:"draft"})
  //   const temp={...book,status:"draft"}
  //   // const temp1=[...book,temp]

  //  set(temp)
  //    console.log("book in model in edit",bookUpdated)
  //     closeModal()
  // }


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
                        label="Book Name in Tamil"
                        variant="outlined"
                        name="title_tamil"
                        onChange={onChangeHandler}
                        value={bookUpdated.title_tamil}
                    
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
                        onChange={onChangeHandler}
                        checked={bookUpdated.is_available}
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
                    value={bookUpdated.date_published || '2023-12-10'}
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
                <Grid item xs={12}>
                  <Select
                    placeholder="Choose Related Books"
                    isMulti
                    closeMenuOnSelect={false}
                    options={relatedBooks}
                    name="related_books"
                    // value={bookUpdated.related_books}
                    value={bookUpdated.related_books}
                    onChange={(val) => {
                      setBookUpdated((prevState) => ({
                        ...prevState,
                        related_books: [...val],
                      }));
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              {/* <bookUpdatedUpload onChangeHandler={onChangeHandler} bookUpdated={bookUpdated} type="bookUpdated" /> */}
              {/* <Upload/> */}
              <UploadedImage
                selectedfile={selectedfile}
                SetSelectedFile={SetSelectedFile}
                setDeletedImages={setDeletedImages}
              />
            </Grid>
          </Grid>
          <div className={classes.uploadBtns}>
     
            {book ?   (
              <><Button
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
                onClick={() => saveHandler('publish')}
               
              >
                Publish
              </Button>
              {/* <Button
                variant="contained"
                sx={{
                  background: '#F19E38',
                  color: '#fff',
                  transition: '1s',
                  marginLeft:"9px",
                  '&: hover': {
                    background: '#F19E38',
                    color: '#fff',
                    transition: '1s',
                  },
                }}
                onClick={handleUnPublish}
                disabled={book.status ==="draft" ? true :false}
              >
                UnPublish
              </Button> */}
              
              </>
              
            ) : (
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
                onClick={() => saveHandler('draft')}
              >
                Save as Draft
              </Button>
            )}

            <Button variant="outlined" className={classes.uploadCancelBtn} onClick={closeModal} >
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
