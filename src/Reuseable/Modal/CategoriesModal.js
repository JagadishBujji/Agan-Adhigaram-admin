import { useEffect, useState } from 'react';
import Select from 'react-select';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
// import Upload from '../Settings/Upload';
import CategoryUpload from '../Upload/CategoryUpload';
import classes from './CategoriesModal.module.css';
import { db, storage } from '../../services/firebase';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { areArraysEqual, isNumeric } from '../../utils/validation';
import BasicSelect from '../Select/Select';
import { Publish } from '@mui/icons-material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  // border: '2px solid #000',
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

export default function CategoriesModal({ categories, setCategories, open, close, categoryData }) {
  const [category, setCategory] = useState([]);
  const [listCategory, setListCategory] = useState({ show: false, values: [] });

  // useEffect(() => {
  //   // console.log(categories.length, categoryData);
  //   if (categoryData) {
  //     let filteredArray = [];
  //     // edit
  //     if (categoryData.listType === 'category') {
  //       const arr = categories
  //         .filter((cat) => {
  //           const lower = cat.name.toLowerCase();
  //           return !lower.includes('super') && !lower.includes('combo');
  //         })
  //         .map((cat) => ({ value: cat.id, label: cat.name }));

  //       setListCategory({
  //         show: true,
  //         values: arr,
  //       });
  //       filteredArray = arr.filter((item) => categoryData.categoryList.includes(item.value));
  //       // console.log('arr', arr, filteredArray);
  //     }
  //     setCategory({
  //       ...categoryData,
  //       imgUrlLocal: categoryData.imgUrl,
  //       img: '',
  //       categoryList: [...filteredArray],
  //     });
  //   } else {
  //     setCategory((prevState) => ({
  //       ...prevState,
  //       order_id: categories?.length + 1,
  //     }));
  //   }
  // }, [categories, categoryData]);

  //  useEffect(()=>{
  //   setCategory(categories)
  //  },[])

  const handleClose = () => {
    close();
    // setCategory({
    //   name: '',
    //   img: '',
    //   imgUrl: '',
    //   imgUrlLocal: '',
    //   deliveryMsg: '',
    //   isAvailable: false,
    //   listType: '',
    //   categoryList: [],
    //   orderNo: categories?.length + 1,
    // });
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);
    setCategory((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });

    // if (name === 'img') {
    //   const file = e.target.files[0];
    //   return {
    //     ...prevState,
    //     [name]: file,
    //     imgUrlLocal: URL.createObjectURL(file),
    //   };
    // } else if (name === 'title') {
    //   console.log('orderNo');
    //   if (parseInt(value) <= categories?.length + 1) {
    //     return {
    //       ...prevState,
    //       [name]: value,
    //     };
    //   }
    // } else if (name === 'isAvailable') {
    //   return {
    //     ...prevState,
    //     [name]: e.target.checked,
    //   };
    // } else if (name === 'listType') {
    //   if (value === 'product') {
    //     setListCategory({
    //       show: false,
    //       values: [],
    //     });
    //   } else {
    //     const arr = categories
    //       .filter((cat) => {
    //         const lower = cat.name.toLowerCase();
    //         return !lower.includes('super') && !lower.includes('combo');
    //       })
    //       .map((cat) => ({ value: cat.id, label: cat.name }));

    //     // console.log('arr', arr);
    //     setListCategory({
    //       show: true,
    //       values: arr,
    //     });
    //   }
    // }
  };
  console.log('setCategory', category);
  const onChangeCategoryListHandler = (values) => {
    // console.log('va', values);
    setCategory((prevState) => ({
      ...prevState,
      categoryList: values,
    }));
  };



  // const saveHandler = () => {
  //   let isImageData = false; // false - only values, true - img + values
  //   // console.log('cat:', category);
  //   if (!category.name) {
  //     alert('Category Name should not be empty');
  //     return;
  //   }
  //   // if (!isNumeric(category.orderNo)) {
  //   //   alert('Order number should be number and not other characters');
  //   //   return;
  //   // }

  //   // if (parseInt(category.orderNo) > categories?.length + 1) {
  //   //   alert('Order number should not be greater than total categories + 1');
  //   //   return;
  //   // }

  //   // if (category.listType === 'category' && category.categoryList.length === 0) {
  //   //   alert('Category List should not be empty, when list type is category');
  //   //   return;
  //   // }

  //   // if (categoryData) {
  //   //   // edit
  //   //   if (
  //   //     categoryData.name === category.name &&
  //   //     categoryData.deliveryMsg === category.deliveryMsg &&
  //   //     categoryData.orderNo === category.orderNo &&
  //   //     categoryData.isAvailable === category.isAvailable &&
  //   //     categoryData.listType === 'product' &&
  //   //     category.imgUrl === categoryData.imgUrl &&
  //   //     category.img === null
  //   //   ) {
  //   //     alert('Nothing to update.');
  //   //   } else if (
  //   //     categoryData.name === category.name &&
  //   //     categoryData.deliveryMsg === category.deliveryMsg &&
  //   //     categoryData.orderNo === category.orderNo &&
  //   //     categoryData.isAvailable === category.isAvailable &&
  //   //     categoryData.listType === 'category' &&
  //   //     areArraysEqual(category.categoryList, categoryData.categoryList) &&
  //   //     category.imgUrl === categoryData.imgUrl &&
  //   //     category.img === null
  //   //   ) {
  //   //     alert('Nothing to update.');
  //   //   } else if (category.img === '' && category.imgUrlLocal === categoryData.imgUrl) {
  //   //     // only values update
  //   //     console.log('only values:', categoryData, category);
  //   //     isImageData = false;
  //   //   } else {
  //   //     console.log('only values img:', categoryData, category);
  //   //     isImageData = true;
  //   //   }
  //   // } else {
  //   //   // new
  //   //   if (!category.img) {
  //   //     alert('Category Image should not be empty');
  //   //     return;
  //   //   }
  //   //   isImageData = true;
  //   // }

  //   // firestore
  //   // const newCategory = {
  //   //   name: category.title,
  //   //   imgUrl: url,
  //   //   // deliveryMsg: category.deliveryMsg,
  //   //   // orderNo: category.orderNo,
  //   //   isAvailable: category.isAvailable,
  //   //   // listType: category.listType,
  //   // };
  //   // if (category.listType === 'category') {
  //   //   newCategory.categoryList = category.categoryList.map((cat) => cat.value);
  //   // }
  //   if (isImageData) {
  //     const storageRef = ref(storage, `categories/${category.img.name}`);
  //     uploadBytes(storageRef, category.img)
  //       .then(() => getDownloadURL(storageRef))
  //       .then((url) => {
  //         newCategory.imgUrl = url;
  //         if (categoryData) {
  //           // update doc
  //           updateDoc(doc(db, 'books', categoryData.id), newCategory)
  //             .then(() => {
  //               console.log('Updated Successfully...');
  //               const storage = getStorage();
  //               const fileRef = ref(storage, categoryData.imgUrl);
  //               deleteObject(fileRef)
  //                 .then(() => {
  //                   console.log('File deleted successfully');
  //                 })
  //                 .catch((error) => {
  //                   console.log('Error deleting file:', error);
  //                 });
  //               setCategories((prevState) => {
  //                 const arr = [...prevState];
  //                 const index = arr.findIndex((cat) => cat.id === categoryData.id);
  //                 const updatedCategory = {
  //                   ...arr[index],
  //                   ...newCategory,
  //                 };
  //                 arr[index] = updatedCategory;
  //                 return [...arr];
  //               });
  //               handleClose();
  //             })
  //             .catch((e) => console.log('updateDoc:', e));
  //         } else {
  //           addDoc(collection(db, 'categories'), newCategory)
  //             .then((docRef) => {
  //               console.log('Document written with ID: ', docRef.id);
  //               newCategory.id = docRef.id;
  //               setCategories((prevState) => [...prevState, newCategory]);
  //               handleClose();
  //             })
  //             .catch((e) => console.log(e));
  //         }
  //       })
  //       .catch((e) => console.log('img upload err:', e));
  //   } else {
  //     if (categoryData) {
  //       // update doc
  //       updateDoc(doc(db, 'categories', categoryData.id), newCategory)
  //         .then(() => {
  //           console.log('Updated Successfully...');
  //           setCategories((prevState) => {
  //             const arr = [...prevState];
  //             const index = arr.findIndex((cat) => cat.id === categoryData.id);
  //             const updatedCategory = {
  //               ...arr[index],
  //               ...newCategory,
  //             };
  //             arr[index] = updatedCategory;
  //             return [...arr];
  //           });
  //           handleClose();
  //         })
  //         .catch((e) => console.log('updateDoc:', e));
  //     } else {
  //       addDoc(collection(db, 'books'), newCategory)
  //         .then((docRef) => {
  //           console.log('Document written with ID: ', docRef.id);
  //           newCategory.id = docRef.id;
  //           setCategories((prevState) => [...prevState, newCategory]);
  //           handleClose();
  //         })
  //         .catch((e) => console.log(e));
  //     }
  //   }
  // };
  const saveHandler = async () => {
    const docRef = await addDoc(collection(db, 'books'), {
      amazon_link: '',
      author: category.author,
      book_format: category.book_format,
      book_id: '',
      date_published: new Date(category.date_published).getTime(),
      description: '',
      discount_percentage: 0,
      discount_price: 0,
      genre: category.genre,
      illustrator:category.illustrator,
      images: [
        'https://firebasestorage.googleapis.com/v0/b/agan-adhigaram.appspot.com/o/vadai.png?alt=media',
        ' https://firebasestorage.googleapis.com/v0/b/agan-adhigaram.appspot.com/o/vadaibook.png?alt=media',
        'https://firebasestorage.googleapis.com/v0/b/agan-adhigaram.appspot.com/o/smallvadibook.svg?alt=media',
        'https://firebasestorage.googleapis.com/v0/b/agan-adhigaram.appspot.com/o/vadaileaf.svg?alt=media',
        'https://firebasestorage.googleapis.com/v0/b/agan-adhigaram.appspot.com/o/backvadipostion.svg?alt=media',
        'https://firebasestorage.googleapis.com/v0/b/agan-adhigaram.appspot.com/o/frontvadaipostion.svg?alt=media',
      ],
      language: category.language,
      mrp_price: category.mrp_price,
      pages: category.pages,
      publisher: category.publisher,
      reading_age: category.reading_age,
      status:"draft",
      stock: category.stock,
      title: category.title,
      
    });
    handleClose()

  } ;

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Grid container spacing={2}>
            <Grid item md={6}>
              <form>
                <Grid container spacing={2}>
                  <Typography variant="h4">Book Details</Typography>
                  <Grid item xs={12}>
                    <CategoryUpload onChangeHandler={onChangeHandler} category={category} type="category" />
                  </Grid>
                  <Grid item xs={6}>
                    <BasicSelect
                      label="Genres List Type"
                      name="genre"
                      values={[
                        { displayName: 'All Genres', value: 'All Genres' },
                        { displayName: 'Humorous', value: 'Humorous' },
                        { displayName: 'Cultural', value: 'Cultural' },
                        { displayName: 'Adventure', value: 'Adventure' },
                      ]}
                      value={category.genre}
                      onChange={onChangeHandler}
                    />
                  </Grid>
                  <Grid item md={6}>
                    <Item>
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Book Name"
                        variant="outlined"
                        name="title"
                        onChange={onChangeHandler}
                        value={category.title}
                      />
                    </Item>
                  </Grid>
                  <Grid item md={6}>
                    <Item>
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Author Name"
                        variant="outlined"
                        name="author"
                        type="text"
                        onChange={onChangeHandler}
                        value={category.author}
                      />
                    </Item>
                  </Grid>
                  <Grid item md={6}>
                    <Item>
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Price"
                        variant="outlined"
                        name="mrp_price"
                        type="text"
                        onChange={onChangeHandler}
                        value={category.mrp_price}
                      />
                    </Item>
                  </Grid>
                  <Grid item md={6}>
                    <Item>
                      <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Stock No"
                        variant="outlined"
                        inputProps={{ type: 'number' }}
                        name="stock"
                        onChange={onChangeHandler}
                        value={category.stock}
                      />
                    </Item>
                  </Grid>
                  <Grid item md={6}>
                    <Typography
                      sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}
                    >
                      <Checkbox
                        name="isAvailable"
                        inputProps={{ 'aria-label': 'Checkbox demo' }}
                        onChange={onChangeHandler}
                        checked={category.isAvailable}
                      />
                      Available
                    </Typography>
                  </Grid>

                  {/* {listCategory.show && (
                    <Grid item xs={12}>
                      <Select
                        isMulti
                        placeholder="Choose categories..."
                        options={listCategory.values}
                        value={category.categoryList}
                        onChange={onChangeCategoryListHandler}
                        name="categoryList"
                      />
                    </Grid>
                  )} */}
                </Grid>
              </form>
            </Grid>
            <Grid item md={6}>
              <Typography variant="h4" className={classes.booktitle}>
                Book Details
              </Typography>
              <Grid container spacing={2}>
                {/* <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Author"
                    variant="outlined"
                    name="author"
                    onChange={onChangeHandler}
                    value={category.author}
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
                    value={category.illustrator}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Edition Language"
                    variant="outlined"
                    name="language"
                    onChange={onChangeHandler}
                    value={category.language}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Book Format"
                    variant="outlined"
                    name="book_format"
                    onChange={onChangeHandler}
                    value={category.book_format}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="date"
                    fullWidth
                    id="outlined-basic"
                    // label="Date Published"
                    variant="outlined"
                    name="date_published"
                    onChange={onChangeHandler}
                    value={category.date_published}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Publisher"
                    variant="outlined"
                    name="publisher"
                    onChange={onChangeHandler}
                    value={category.publisher}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Pages"
                    variant="outlined"
                    name="pages"
                    type="pages"
                    onChange={onChangeHandler}
                    value={category.pages}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Reading Age"
                    variant="outlined"
                    name="reading_age"
                    onChange={onChangeHandler}
                    value={category.reading_age}
                  />
                </Grid>
              </Grid>
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
            <Button variant="outlined" className={classes.uploadCancelBtn} onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
