import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Divider, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import TextField from '@mui/material/TextField';
import classes from './ProductModal.module.css';
import MultiTextField from '../Districts/MultiTextField';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
  maxHeight: '400px',
};

export default function DistrictModal({
  open,
  close,
  chips,
  inputValue,
  handleInputChange,
  handleKeyPress,
  handleDeleteChip,
  district,
  isAvailable,
  handleIsAvailable,
  superDeliveryCharge,
  handleSuperDeliveryCharge,
  deliveryCharge,
  handleDeliveryCharge,
  msg,
  handleMessage,
  saveHandler,
}) {
  return (
    <div>
      <Modal open={open} onClose={close} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add District
          </Typography>
          <Divider />
          <br />
          <Box sx={{ mb: 2 }}>
            <MultiTextField
              chips={chips}
              inputValue={inputValue}
              handleInputChange={handleInputChange}
              handleKeyPress={handleKeyPress}
              handleDeleteChip={handleDeleteChip}
            />
          </Box>
          <Box component="form" autoComplete="on" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              id="outlined-basic"
              label="District Name"
              disabled
              sx={{ mb: 2 }}
              type="text"
              variant="outlined"
              value={district}
            />
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Available</InputLabel>
                {
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Available"
                    value={isAvailable ? 'Yes' : 'No'}
                    onChange={handleIsAvailable}
                  >
                    {/* <MenuItem value="None">None</MenuItem> */}
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                }
              </FormControl>
            </Box>
            <TextField
              fullWidth
              id="outlined-basic"
              label="Super Delivery charge"
              sx={{ mb: 2 }}
              type="number"
              variant="outlined"
              value={superDeliveryCharge}
              onChange={handleSuperDeliveryCharge}
            />
            <TextField
              fullWidth
              id="outlined-basic"
              label="Delivery charge"
              sx={{ mb: 2 }}
              type="number"
              variant="outlined"
              value={deliveryCharge}
              onChange={handleDeliveryCharge}
            />
            <TextField
              fullWidth
              id="outlined-basic"
              label="Message"
              sx={{ mb: 2 }}
              type="text"
              variant="outlined"
              value={msg}
              onChange={handleMessage}
            />

            <Stack direction="row" spacing={2} sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
              <Button variant="contained" className={classes.productSaveBtn} onClick={saveHandler}>
                Save
              </Button>
              <Button variant="outlined" className={classes.productCancelBtn} onClick={close}>
                Cancel
              </Button>
            </Stack>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
