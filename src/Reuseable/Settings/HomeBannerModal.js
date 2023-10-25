import * as React from 'react';
import { Divider } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Iconify from '../../components/iconify/Iconify';
import Upload from './Upload';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  // border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: '10px',
};

export default function HomeBannerModal({ addNewBanner }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
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
        startIcon={<Iconify icon="eva:plus-fill" />}
        onClick={handleOpen}
      >
        Create New Banner
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Home Banner
          </Typography>
          <Divider />
          <Upload closeModal={handleClose} addNewBanner={addNewBanner} />
        </Box>
      </Modal>
    </div>
  );
}
