import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
// components
import Iconify from '../components/iconify';
// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppCurrentSubject,
  AppConversionRates,
} from '../sections/@dashboard/app';
import SettingsTabs from '../Reuseable/Settings/SettingsTabs';

// ----------------------------------------------------------------------

export default function SettingPage() {
  const theme = useTheme();

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
