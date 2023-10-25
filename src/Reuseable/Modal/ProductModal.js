import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import CategoryUpload from '../Upload/CategoryUpload';
import ProductUpload from '../Upload/ProductUpload';
import BasicSelect from '../Select/Select';
import MinimumStock from '../MinimumStock/MinimumStock';
import classes from './ProductModal.module.css';
import { truncate } from 'lodash';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  height: 400,
  overflow: 'scroll',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function ProductModal({ open, product, setProduct, handleOpen, handleClose, saveHandler }) {
  const [showNumberOfItems, setShowNumberOfItems] = useState(product.minStock > -1);

  const handleLimitedMinStock = () => {
    setShowNumberOfItems(true);
  };
  const handleUnlimitedMinStock = () => {
    setShowNumberOfItems(false);
  };

  // useEffect(() => {}, []);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setProduct((prevState) => {
      if (name === 'img') {
        const image = e.target.files[0];
        return {
          ...prevState,
          [name]: image,
          imgUrlLocal: URL.createObjectURL(image),
        };
      } else if (name === 'isAvailable') {
        return {
          ...prevState,
          [name]: e.target.checked,
        };
      } else if (name === 'district') {
        // console.log('district:', name, value, prevState.price[value]);
        if (prevState[value]) {
          return {
            ...prevState,
            [name]: value,
          };
        } else {
          if (!prevState.price[value]) {
            return {
              ...prevState,
              [name]: value,
              price: {
                ...prevState.price,
                [value]: {
                  costPrice: 0,
                  offerPrice: 0,
                  sellingPrice: 0,
                  tax: {
                    cgstAmount: 0,
                    cgstPercentage: 0,
                    sgstAmount: 0,
                    sgstPercentage: 0,
                    totalAmount: 0,
                  },
                },
              },
            };
          } else {
            return {
              ...prevState,
              [name]: value,
              price: {
                ...prevState.price,
                [value]: {
                  ...prevState.price[value],
                },
              },
            };
          }
        }
      } else if (name === 'costPrice' || name === 'offerPrice' || name === 'sellingPrice') {
        // console.log('price:', name, value, prevState.price[prevState.district]);
        return {
          ...prevState,
          price: {
            ...prevState.price,
            [prevState.district]: {
              ...prevState.price[prevState.district],
              [name]: value,
            },
          },
        };
      } else if (name === 'minStockRadio') {
        // console.log('minStock', name, value);
        if (value === 'unlimited') {
          handleUnlimitedMinStock();
          return {
            ...prevState,
            minStock: -1,
          };
        } else {
          handleLimitedMinStock();
          return {
            ...prevState,
            minStock: 0,
          };
        }
      }
      return {
        ...prevState,
        [name]: value,
      };
    });
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
          <Grid container spacing={2}>
            <Grid item md={12}>
              <Item>
                <TextField
                  id="outlined-basic"
                  label="Name"
                  variant="outlined"
                  fullWidth
                  name="name"
                  value={product.name}
                  onChange={onChangeHandler}
                />
              </Item>
            </Grid>
            <Grid item md={12}>
              <Item>
                <TextField
                  id="outlined-multiline-static"
                  label="Description"
                  multiline
                  rows={4}
                  defaultValue="Type Something..."
                  fullWidth
                  name="description"
                  value={product.description}
                  onChange={onChangeHandler}
                />
              </Item>
            </Grid>
            <Grid item md={12}>
              <Item className={classes.productCoverImgBtn}>
                {/* <CategoryUpload type="productCover" /> */}
                <div className={classes.upload}>
                  <Button
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
                    variant="contained"
                    component="label"
                  >
                    Upload CoverImage
                    <input type="file" accept="image/*" name="img" hidden onChange={onChangeHandler} />
                  </Button>
                  {product?.imgUrlLocal && (
                    <img src={product?.imgUrlLocal} alt="Preview" className={classes.uploadImage} />
                  )}
                </div>
              </Item>
            </Grid>
            <Grid item md={12}>
              <Item>
                <Typography
                  sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}
                >
                  <Checkbox
                    name="isAvailable"
                    inputProps={{ 'aria-label': 'Is product available' }}
                    onChange={onChangeHandler}
                    checked={product.isAvailable}
                  />
                  Available
                </Typography>
              </Item>
            </Grid>
            <Grid item md={12}>
              <Item>
                <BasicSelect
                  label="Choose district for entering price"
                  values={product.districts}
                  value={product.district}
                  name="district"
                  onChange={onChangeHandler}
                />
              </Item>
            </Grid>
            {product.district !== '' && (
              <>
                <Grid item md={12}>
                  <Item>
                    <TextField
                      fullWidth
                      id="outlined-number"
                      label="Cost Price"
                      type="number"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      name="costPrice"
                      value={product.price[product.district].costPrice}
                      onChange={onChangeHandler}
                    />
                  </Item>
                </Grid>
                <Grid item md={12}>
                  <Item>
                    <TextField
                      fullWidth
                      id="outlined-number"
                      label="Offer Price"
                      type="number"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      name="offerPrice"
                      value={product.price[product.district].offerPrice}
                      onChange={onChangeHandler}
                    />
                  </Item>
                </Grid>
                <Grid item md={12}>
                  <Item>
                    <TextField
                      fullWidth
                      id="outlined-number"
                      label="Selling Price"
                      type="number"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      name="sellingPrice"
                      value={product.price[product.district].sellingPrice}
                      onChange={onChangeHandler}
                    />
                  </Item>
                </Grid>
              </>
            )}

            <Grid item md={12}>
              <Item>
                <TextField
                  fullWidth
                  id="outlined-number"
                  label="Quantity"
                  type="number"
                  name="quantity"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={product.quantity}
                  onChange={onChangeHandler}
                />
              </Item>
            </Grid>
            <Grid item md={12}>
              <Item>
                <BasicSelect
                  label="Unit"
                  values={[
                    { displayName: 'gm', value: 'gm' },
                    { displayName: 'kg', value: 'kg' },
                  ]}
                  name="unit"
                  onChange={onChangeHandler}
                  value={product.unit}
                />
              </Item>
            </Grid>
            <Grid item md={12}>
              <Item className={classes.minStock}>
                <MinimumStock onChangeHandler={onChangeHandler} value={product.minStock} name="minStockRadio" />
              </Item>
              {showNumberOfItems ? (
                <TextField
                  value={product.minStock}
                  name="minStock"
                  onChange={onChangeHandler}
                  fullWidth
                  id="outlined-number"
                  label="No. of items"
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              ) : null}
            </Grid>
          </Grid>
          <div className={classes.productBtns}>
            <Button variant="contained" className={classes.productSaveBtn} onClick={saveHandler}>
              Save
            </Button>
            <Button variant="outlined" className={classes.productCancelBtn} onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
