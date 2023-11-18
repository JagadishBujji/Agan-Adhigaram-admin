import { Button, Card, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';

const Upload = ({ closeModal, addNewBanner }) => {
  const [image, setImage] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);

  function handleImageUpload(e) {
    const uploadedImage = e.target.files[0];
    setImage(uploadedImage);
  }

  const handleSave = () => {
    if (image === null) {
      alert('Please choose an image to proceed further.');
      return;
    }
    const banner = {
      id: +new Date().getTime(),
      gotoId: '',
      gotoType: '',
      imgUrl: '',
    };
    setIsDisabled(true);
    addNewBanner(banner, image, (isSuccess) => {
      if (isSuccess) {
        closeModal();
        setIsDisabled(false);
      }
    });
  };

  return (
    <>
      <Typography variant="h6" sx={{ marginTop: '10px', padding: '10px' }} gutterBottom>
        Uploaded Image
      </Typography>
      <Card sx={{ marginTop: '10px', padding: '10px' }}>
        {image && <img src={URL.createObjectURL(image)} alt="uploaded" style={{ width: '100%' }} />}
      </Card>
      <Stack>
        <Button
          sx={{
            background: '#f19e38',
            color: '#fff',
            transition: '1s',
            '&: hover': {
              background: '#f19e38',
              color: '#fff',
              transition: '1s',
            },
          }}
          variant="contained"
          component="label"
        >
          Upload
          <input onChange={handleImageUpload} hidden accept="image/*" multiple type="file" />
        </Button>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mt: 2 }}>
        <Button
          sx={{
            background: '#f19e38',
            color: '#fff',
            transition: '1s',
            '&: hover': {
              background: '#f19e38',
              color: '#fff',
              transition: '1s',
            },
          }}
          variant="contained"
          component="label"
          onClick={handleSave}
          disabled={isDisabled}
        >
          Save
        </Button>
        <Button
          onClick={closeModal}
          sx={{
            marginTop: '10px',
            border: '1px solid #f19e38',
            color: '#f19e38',
            background: 'transparent',
            '&: hover': {
              border: '1px solid #f19e38',
              color: '#f19e38',
              background: 'transparent',
            },
          }}
          variant="outlined"
        >
          Cancel
        </Button>
      </Stack>
    </>
  );
};

export default Upload;
