import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Autocomplete, Divider, Grid, Stack, TextField } from '@mui/material';
import { errorNotification } from 'src/utils/notification';
import { DEFAULT_LOGISTIC_PARTNERS, isValidUrl } from 'src/utils/logistics';
import { getStoreSettings } from 'src/api/appMeta';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '92%', sm: 500 },
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
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

// Dispatch details - any logistic partner can be typed, saved partners are shown as suggestions
export default function LogisticsModal({ title, btnTitle, handleSubmit }) {
  const [open, setOpen] = useState(false);
  const [partners, setPartners] = useState(DEFAULT_LOGISTIC_PARTNERS);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  const handleClose = () => {
    setOpen(false);
    setName('');
    setNumber('');
    setTrackingUrl('');
  };

  const handleOpen = () => {
    setOpen(true);
    getStoreSettings()
      .then((settings) => setPartners(settings.logisticPartners))
      .catch((e) => console.log('logistic partners: ', e));
  };

  const findPartner = (partnerName) =>
    partners.find((partner) => partner.name.toLowerCase() === partnerName.trim().toLowerCase());

  const handleNameChange = (value) => {
    const newName = value || '';
    setName(newName);
    // fill the tracking link of the saved partner
    const partner = findPartner(newName);
    if (partner) {
      setTrackingUrl(partner.tracking_url || '');
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const logisticName = name.trim();
    const logisticNumber = number.trim();
    const logisticUrl = trackingUrl.trim();

    if (logisticName === '' || logisticNumber === '') {
      errorNotification('Missing Mandatory Information. Please enter both logistic partner and tracking number.');
    } else if (logisticUrl !== '' && !isValidUrl(logisticUrl)) {
      errorNotification('Invalid tracking link. It should start with http:// or https://');
    } else {
      const partner = findPartner(logisticName);
      handleSubmit(
        {
          // keep the saved partner name, so the same partner is not stored in different cases
          name: partner ? partner.name : logisticName,
          number: logisticNumber,
          tracking_url: logisticUrl,
          isNewPartner: !partner || (partner.tracking_url || '') !== logisticUrl,
        },
        () => handleClose()
      );
    }
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
      <Modal open={open} onClose={handleClose} aria-labelledby="logistics-modal-title">
        <Box sx={style} component="form" onSubmit={submitHandler}>
          <Typography id="logistics-modal-title" variant="h6" component="h2">
            {title}
          </Typography>

          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Autocomplete
                freeSolo
                options={partners.map((partner) => partner.name)}
                inputValue={name}
                onInputChange={(e, value) => handleNameChange(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Logistic Partner"
                    helperText="Select a partner or type a new one"
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Logistic Number (Tracking No.)"
                variant="outlined"
                name="number"
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tracking Link (optional)"
                placeholder="https://"
                helperText="Customer can open this link from the mail to track the order"
                variant="outlined"
                name="tracking_url"
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
              />
            </Grid>
          </Grid>

          <Stack
            spacing={2}
            direction="row"
            sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mt: 2 }}
          >
            <Button sx={save} variant="contained" type="submit">
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
