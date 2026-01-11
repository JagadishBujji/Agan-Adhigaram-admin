import { Helmet } from 'react-helmet-async';
// @mui
import { Container, Typography } from '@mui/material';
// components
import SettingsTabs from '../Reuseable/Settings/SettingsTabs';

// ----------------------------------------------------------------------

export default function SettingPage() {
  return (
    <>
      <Helmet>
        <title>  Agan Adhigaram | Settings </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Settings
        </Typography>

        <SettingsTabs />
      </Container>
    </>
  );
}
