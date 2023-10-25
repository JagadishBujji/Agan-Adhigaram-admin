import React, { useState } from 'react';
import { Button } from '@mui/material';

const ProductUpload = () => {
  const [selectedImages, setSelectedImages] = useState([]);

  const handleImageUpload = (event) => {
    const files = event.target.files;
    const uploadedImages = [];

    for (let i = selectedImages.length - 1; i < files.length + selectedImages.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        uploadedImages.push(e.target.result);

        if (uploadedImages.length === files.length) {
          setSelectedImages(uploadedImages);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <Button
        sx={{
          background: '#9F3239',
          color: '#fff',
          transition: '1s',
          marginBottom: 2,
          '&: hover': {
            background: '#9F3239',
            color: '#fff',
            transition: '1s',
          },
        }}
        variant="contained"
        component="label"
      >
        Upload Images
        <input onChange={handleImageUpload} hidden accept="image/*" multiple type="file" />
      </Button>
      <div>
        {selectedImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Preview ${index + 1}`}
            style={{ width: '100px', height: 'auto', marginRight: '10px' }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductUpload;
