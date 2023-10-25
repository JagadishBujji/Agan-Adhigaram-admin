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

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
  maxHeight: '500px',
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function CategoriesModal({ categories, setCategories, open, close, categoryData }) {
  const [category, setCategory] = useState({
    name: '',
    img: '',
    imgUrl: '',
    imgUrlLocal: '',
    deliveryMsg: '',
    isAvailable: false,
    listType: '',
    categoryList: [],
    orderNo: categories?.length + 1,
  });
  const [listCategory, setListCategory] = useState({ show: false, values: [] });

  useEffect(() => {
    // console.log(categories.length, categoryData);
    if (categoryData) {
      let filteredArray = [];
      // edit
      if (categoryData.listType === 'category') {
        const arr = categories
          .filter((cat) => {
            const lower = cat.name.toLowerCase();
            return !lower.includes('super') && !lower.includes('combo');
          })
          .map((cat) => ({ value: cat.id, label: cat.name }));

        setListCategory({
          show: true,
          values: arr,
        });
        filteredArray = arr.filter((item) => categoryData.categoryList.includes(item.value));
        // console.log('arr', arr, filteredArray);
      }
      setCategory({
        ...categoryData,
        imgUrlLocal: categoryData.imgUrl,
        img: '',
        categoryList: [...filteredArray],
      });
    } else {
      setCategory((prevState) => ({
        ...prevState,
        orderNo: categories?.length + 1,
      }));
    }
  }, [categories, categoryData]);

  const handleClose = () => {
    close();
    setCategory({
      name: '',
      img: '',
      imgUrl: '',
      imgUrlLocal: '',
      deliveryMsg: '',
      isAvailable: false,
      listType: '',
      categoryList: [],
      orderNo: categories?.length + 1,
    });
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);
    setCategory((prevState) => {
      if (name === 'img') {
        const file = e.target.files[0];
        return {
          ...prevState,
          [name]: file,
          imgUrlLocal: URL.createObjectURL(file),
        };
      } else if (name === 'orderNo') {
        console.log('orderNo');
        if (parseInt(value) <= categories?.length + 1) {
          return {
            ...prevState,
            [name]: value,
          };
        }
      } else if (name === 'isAvailable') {
        return {
          ...prevState,
          [name]: e.target.checked,
        };
      } else if (name === 'listType') {
        if (value === 'product') {
          setListCategory({
            show: false,
            values: [],
          });
        } else {
          const arr = categories
            .filter((cat) => {
              const lower = cat.name.toLowerCase();
              return !lower.includes('super') && !lower.includes('combo');
            })
            .map((cat) => ({ value: cat.id, label: cat.name }));

          // console.log('arr', arr);
          setListCategory({
            show: true,
            values: arr,
          });
        }
      }
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  const onChangeCategoryListHandler = (values) => {
    // console.log('va', values);
    setCategory((prevState) => ({
      ...prevState,
      categoryList: values,
    }));
  };

  const saveHandler = () => {
    let isImageData = false; // false - only values, true - img + values
    // console.log('cat:', category);
    if (!category.name) {
      alert('Category Name should not be empty');
      return;
    }
    if (!isNumeric(category.orderNo)) {
      alert('Order number should be number and not other characters');
      return;
    }

    if (parseInt(category.orderNo) > categories?.length + 1) {
      alert('Order number should not be greater than total categories + 1');
      return;
    }

    if (category.listType === 'category' && category.categoryList.length === 0) {
      alert('Category List should not be empty, when list type is category');
      return;
    }

    if (categoryData) {
      // edit
      if (
        categoryData.name === category.name &&
        categoryData.deliveryMsg === category.deliveryMsg &&
        categoryData.orderNo === category.orderNo &&
        categoryData.isAvailable === category.isAvailable &&
        categoryData.listType === 'product' &&
        category.imgUrl === categoryData.imgUrl &&
        category.img === null
      ) {
        alert('Nothing to update.');
      } else if (
        categoryData.name === category.name &&
        categoryData.deliveryMsg === category.deliveryMsg &&
        categoryData.orderNo === category.orderNo &&
        categoryData.isAvailable === category.isAvailable &&
        categoryData.listType === 'category' &&
        areArraysEqual(category.categoryList, categoryData.categoryList) &&
        category.imgUrl === categoryData.imgUrl &&
        category.img === null
      ) {
        alert('Nothing to update.');
      } else if (category.img === '' && category.imgUrlLocal === categoryData.imgUrl) {
        // only values update
        console.log('only values:', categoryData, category);
        isImageData = false;
      } else {
        console.log('only values img:', categoryData, category);
        isImageData = true;
      }
    } else {
      // new
      if (!category.img) {
        alert('Category Image should not be empty');
        return;
      }
      isImageData = true;
    }

    // firestore
    const newCategory = {
      name: category.name,
      // imgUrl: url,
      deliveryMsg: category.deliveryMsg,
      orderNo: category.orderNo,
      isAvailable: category.isAvailable,
      listType: category.listType,
    };
    if (category.listType === 'category') {
      newCategory.categoryList = category.categoryList.map((cat) => cat.value);
    }
    if (isImageData) {
      const storageRef = ref(storage, `categories/${category.img.name}`);
      uploadBytes(storageRef, category.img)
        .then(() => getDownloadURL(storageRef))
        .then((url) => {
          newCategory.imgUrl = url;
          if (categoryData) {
            // update doc
            updateDoc(doc(db, 'categories', categoryData.id), newCategory)
              .then(() => {
                console.log('Updated Successfully...');
                const storage = getStorage();
                const fileRef = ref(storage, categoryData.imgUrl);
                deleteObject(fileRef)
                  .then(() => {
                    console.log('File deleted successfully');
                  })
                  .catch((error) => {
                    console.log('Error deleting file:', error);
                  });
                setCategories((prevState) => {
                  const arr = [...prevState];
                  const index = arr.findIndex((cat) => cat.id === categoryData.id);
                  const updatedCategory = {
                    ...arr[index],
                    ...newCategory,
                  };
                  arr[index] = updatedCategory;
                  return [...arr];
                });
                handleClose();
              })
              .catch((e) => console.log('updateDoc:', e));
          } else {
            addDoc(collection(db, 'categories'), newCategory)
              .then((docRef) => {
                console.log('Document written with ID: ', docRef.id);
                newCategory.id = docRef.id;
                setCategories((prevState) => [...prevState, newCategory]);
                handleClose();
              })
              .catch((e) => console.log(e));
          }
        })
        .catch((e) => console.log('img upload err:', e));
    } else {
      if (categoryData) {
        // update doc
        updateDoc(doc(db, 'categories', categoryData.id), newCategory)
          .then(() => {
            console.log('Updated Successfully...');
            setCategories((prevState) => {
              const arr = [...prevState];
              const index = arr.findIndex((cat) => cat.id === categoryData.id);
              const updatedCategory = {
                ...arr[index],
                ...newCategory,
              };
              arr[index] = updatedCategory;
              return [...arr];
            });
            handleClose();
          })
          .catch((e) => console.log('updateDoc:', e));
      } else {
        addDoc(collection(db, 'categories'), newCategory)
          .then((docRef) => {
            console.log('Document written with ID: ', docRef.id);
            newCategory.id = docRef.id;
            setCategories((prevState) => [...prevState, newCategory]);
            handleClose();
          })
          .catch((e) => console.log(e));
      }
    }
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form>
            <Grid container spacing={2}>
              <Grid item md={12}>
                <Item>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Category Name"
                    variant="outlined"
                    name="name"
                    onChange={onChangeHandler}
                    value={category.name}
                  />
                </Item>
              </Grid>
              <Grid item xs={12}>
                <Item>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Delivery Message (Optional)"
                    variant="outlined"
                    name="deliveryMsg"
                    onChange={onChangeHandler}
                    value={category.deliveryMsg}
                  />
                </Item>
              </Grid>
              <Grid item xs={12}>
                <Item>
                  <TextField
                    fullWidth
                    id="outlined-basic"
                    label="Order No"
                    variant="outlined"
                    inputProps={{ type: 'number' }}
                    name="orderNo"
                    onChange={onChangeHandler}
                    value={category.orderNo}
                  />
                </Item>
              </Grid>
              <Grid item xs={12}>
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
              <Grid item xs={12}>
                <BasicSelect
                  label="Choost List Type"
                  name="listType"
                  values={[
                    { displayName: 'Product', value: 'product' },
                    { displayName: 'Category', value: 'category' },
                  ]}
                  value={category.listType}
                  onChange={onChangeHandler}
                />
              </Grid>
              {listCategory.show && (
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
              )}
              <Grid item xs={12}>
                <CategoryUpload onChangeHandler={onChangeHandler} category={category} type="category" />
              </Grid>
            </Grid>
            <div className={classes.uploadBtns}>
              <Button
                variant="contained"
                sx={{
                  background: '#9F3239',
                  color: '#fff',
                  transition: '1s',
                  '&: hover': {
                    background: '#9F3239',
                    color: '#fff',
                    transition: '1s',
                  },
                }}
                onClick={saveHandler}
              >
                Save
              </Button>
              <Button variant="outlined" className={classes.uploadCancelBtn} onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
}
