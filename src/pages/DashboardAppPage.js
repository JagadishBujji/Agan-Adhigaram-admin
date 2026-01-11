import { Helmet } from 'react-helmet-async';
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
import OrdersPage from './OrdersPage';
import { shallowEqual, useSelector } from 'react-redux';
import { selectOrdersStat } from 'src/store/orderSlice';

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const ordersStat = useSelector((state) => selectOrdersStat(state), shallowEqual);

  const { booked, dispatched, delivered, cancelled } = ordersStat;
  const theme = useTheme();

  return (
    <>
      <Helmet>
        <title> Agan Adhigaram | Dashboard </title>
      </Helmet>

      <Container maxWidth="xl">
        {/* <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Agan Adhigaram
        </Typography> */}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Booked" total={booked} icon={'ant-design:android-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Dispatched" total={dispatched} color="info" icon={'ant-design:apple-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Delivered" total={delivered} color="warning" icon={'ant-design:windows-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Cancelled" total={cancelled} color="error" icon={'ant-design:bug-filled'} />
          </Grid>

          <OrdersPage />
        </Grid>
      </Container>
    </>
  );
}
