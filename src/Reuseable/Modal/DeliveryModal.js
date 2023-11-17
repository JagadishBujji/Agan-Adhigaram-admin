import * as React from 'react';
import Box from '@mui/material/Box';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Divider, Grid, Stack, TextField } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  //   border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: '10px',
};

const save = {
  background: '#9F3239',
  color: '#fff',
  transition: '1s',
  '&: hover': {
    background: '#9F3239',
    color: '#fff',
    transition: '1s',
  },
};
const cancel = {
  border: '1px solid #9F3239',
  color: '#9F3239',
  transition: '1s',
  '&: hover': {
    border: '1px solid #9F3239',
    color: '#9F3239',
    transition: '1s',
  },
};

export default function DeliveryModal({ orderId }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [deliveryName, setDeliveryName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState();
  const handleName = (e) => {
    setDeliveryName(e.target.value);
  };
  const handlePhone = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderDetails = doc(db, 'orders', orderId);
    updateDoc(orderDetails, {
      deliveryBoyDetails: {
        mobile: phoneNumber,
        name: deliveryName,
      },
      status: 'inProgress',
    })
      .then(() => {
        alert('Successfully updated');
      })
      .catch((e) => console.log(e));
  };
  return (
    <div>
      <Button
        onClick={handleOpen}
        sx={{
          border: '1px solid #008000',
          color: '#008000',
          boxShadow: 'none',
          '&:hover': {
            border: '1px solid #008000',
            background: '#008000',
            color: '#fff',
          },
        }}
      >
        Dispatched
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Delivery person details
          </Typography>

          <Divider />
          <Grid container spacing={2}>
            <Grid item md={12} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Delivery Name"
                variant="outlined"
                name="name"
                type="text"
                value={deliveryName}
                onChange={handleName}
              />
            </Grid>
            <Grid item xs={12} sx={{ my: 1 }}>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Delivery Phone"
                variant="outlined"
                name="deliveryMsg"
                type="tel"
                value={phoneNumber}
                onChange={handlePhone}
              />
            </Grid>
          </Grid>

          <Stack
            spacing={2}
            direction="row"
            sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mt: 2 }}
          >
            <Button sx={save} variant="contained" onClick={handleSubmit}>
              Save
            </Button>
            <Button sx={cancel} variant="outlined">
              Cancel
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
}
