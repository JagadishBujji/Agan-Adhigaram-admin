import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Divider, Grid, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from 'src/services/firebase';

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

export default function ModalTwoInputs({ title, btnTitle, label1, label2, handleSubmit, order, updateOrders }) {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setInput1('');
    setInput2('');
  };
// {console.log("ordered inside ",order)}
  const handleOpen =async () => {
    const orderDetail = doc(db, 'orders', order.id);
    const dispatchTime={dispatched_timestamp: new Date().getTime()}
    await updateDoc(orderDetail,dispatchTime)
    updateOrders(order.id,dispatchTime)
    setOpen(true);


  };

  const submitHandler = (e) => {
    e.preventDefault();
    handleSubmit({ input1, input2 }, () => handleClose());
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
        {btnTitle}
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>

          <Divider />
          <Grid container spacing={2}>
            <Grid item md={12} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                id="outlined-basic"
                label={label1}
                variant="outlined"
                name="input1"
                type="text"
                value={input1}
                onChange={(e) => setInput1(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sx={{ my: 1 }}>
              <TextField
                fullWidth
                id="outlined-basic"
                label={label2}
                variant="outlined"
                name="input2"
                type="text"
                value={input2}
                onChange={(e) => setInput2(e.target.value)}
              />
            </Grid>
          </Grid>

          <Stack
            spacing={2}
            direction="row"
            sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mt: 2 }}
          >
            <Button sx={save} variant="contained" onClick={submitHandler}>
              Save
            </Button>
            <Button sx={cancel} variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
}
