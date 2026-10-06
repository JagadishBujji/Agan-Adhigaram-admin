import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
// @mui
import {
  Button,
  Card,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  addLogisticPartner,
  getStoreSettings,
  removeLogisticPartner,
  updateDeliveryCharge,
} from '../api/appMeta';
import { errorNotification, successNotification } from '../utils/notification';
import { isValidUrl } from '../utils/logistics';

const save = {
  background: '#9F3239',
  color: '#fff',
  '&:hover': {
    background: '#9F3239',
    color: '#fff',
  },
};

// ----------------------------------------------------------------------

export default function StoreSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState('');
  const [partners, setPartners] = useState([]);
  const [newPartner, setNewPartner] = useState({ name: '', tracking_url: '' });

  useEffect(() => {
    getStoreSettings()
      .then((settings) => {
        setDeliveryCharge(String(settings.deliveryCharge));
        setPartners(settings.logisticPartners);
      })
      .catch((e) => errorNotification(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const saveDeliveryCharge = (e) => {
    e.preventDefault();
    const charge = Number(deliveryCharge);
    if (deliveryCharge === '' || !Number.isFinite(charge) || charge < 0) {
      errorNotification('Invalid delivery charge. Please enter 0 or more.');
      return;
    }
    setIsSaving(true);
    updateDeliveryCharge(charge)
      .then(() => successNotification('Delivery charge updated. New orders will use this charge.'))
      .catch((e) => errorNotification(e.message))
      .finally(() => setIsSaving(false));
  };

  const addPartner = (e) => {
    e.preventDefault();
    const name = newPartner.name.trim();
    const trackingUrl = newPartner.tracking_url.trim();
    if (name === '') {
      errorNotification('Please enter the logistic partner name.');
    } else if (trackingUrl !== '' && !isValidUrl(trackingUrl)) {
      errorNotification('Invalid tracking link. It should start with http:// or https://');
    } else {
      setIsSaving(true);
      addLogisticPartner({ name, tracking_url: trackingUrl })
        .then((updatedPartners) => {
          setPartners(updatedPartners);
          setNewPartner({ name: '', tracking_url: '' });
          successNotification('Logistic partner saved.');
        })
        .catch((e) => errorNotification(e.message))
        .finally(() => setIsSaving(false));
    }
  };

  const removePartner = (partner) => {
    if (window.confirm(`Remove ${partner.name}? Old orders will not be changed.`)) {
      setIsSaving(true);
      removeLogisticPartner(partner)
        .then((updatedPartners) => {
          setPartners(updatedPartners);
          successNotification('Logistic partner removed.');
        })
        .catch((e) => errorNotification(e.message))
        .finally(() => setIsSaving(false));
    }
  };

  return (
    <>
      <Helmet>
        <title> Agan Adhigaram | Settings </title>
      </Helmet>

      <Container maxWidth="md">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Settings
        </Typography>

        <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Typography variant="h6">Delivery Charge</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Added to every order (within India) at checkout. Already placed orders are not changed.
          </Typography>
          <Stack component="form" onSubmit={saveDeliveryCharge} direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Delivery Charge"
              type="number"
              value={deliveryCharge}
              onChange={(e) => setDeliveryCharge(e.target.value)}
              disabled={isLoading}
              inputProps={{ min: 0, step: 1 }}
              InputProps={{ startAdornment: <InputAdornment position="start">Rs.</InputAdornment> }}
              required
            />
            <Button sx={save} variant="contained" type="submit" disabled={isLoading || isSaving}>
              Save
            </Button>
          </Stack>
        </Card>

        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6">Logistic Partners</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Shown as suggestions while dispatching an order. A new partner typed while dispatching is added here
            automatically.
          </Typography>

          <Stack divider={<Divider flexItem />} spacing={1} sx={{ mb: 3 }}>
            {partners.length === 0 && !isLoading && <Typography>No logistic partners added.</Typography>}
            {partners.map((partner) => (
              <Stack key={partner.name} direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Stack sx={{ minWidth: 0 }}>
                  <Typography fontWeight="bold">{partner.name}</Typography>
                  {partner.tracking_url ? (
                    <Link
                      href={partner.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {partner.tracking_url}
                    </Link>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No tracking link
                    </Typography>
                  )}
                </Stack>
                <IconButton
                  aria-label={`Remove ${partner.name}`}
                  onClick={() => removePartner(partner)}
                  disabled={isSaving}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>

          <Stack component="form" onSubmit={addPartner} direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Partner Name"
              value={newPartner.name}
              onChange={(e) => setNewPartner((prevState) => ({ ...prevState, name: e.target.value }))}
              required
            />
            <TextField
              label="Tracking Link (optional)"
              placeholder="https://"
              type="url"
              value={newPartner.tracking_url}
              onChange={(e) => setNewPartner((prevState) => ({ ...prevState, tracking_url: e.target.value }))}
              sx={{ flexGrow: 1 }}
            />
            <Button sx={save} variant="contained" type="submit" disabled={isLoading || isSaving}>
              Add
            </Button>
          </Stack>
        </Card>
      </Container>
    </>
  );
}
