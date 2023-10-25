import { Button } from '@mui/material';
import React, { useState } from 'react';
import classes from './CategoryUpload.module.css';

const CategoryUpload = ({ category, onChangeHandler, type }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
  };

  return (
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
        Upload Image
        {type === 'category' ? (
          <input name="img" onChange={onChangeHandler} hidden accept="image/*" type="file" />
        ) : (
          <input onChange={handleImageUpload} hidden accept="image/*" multiple type="file" />
        )}
      </Button>
      {category?.imgUrlLocal && <img src={category?.imgUrlLocal} alt="Preview" className={classes.uploadImage} />}
    </div>
  );
};

export default CategoryUpload;
