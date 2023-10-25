import * as React from 'react';
import { Button, Card, Grid, Stack } from '@mui/material';
import Iconify from '../../../components/iconify/Iconify';
import HomeBannerModal from '../../../Reuseable/Settings/HomeBannerModal';
import LongMenu from '../../../Reuseable/Settings/LongMenu';

export default function HomeBanner({ banners, addNewBanner, deleteBanner }) {
  return (
    <>
      <Stack direction="row" sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mb: 2 }}>
        <HomeBannerModal addNewBanner={addNewBanner} deleteBanner={deleteBanner} />
      </Stack>

      <Grid container spacing={3}>
        {banners?.map((banner) => (
          <Grid item xs={12} sm={6} md={4} sx={{ position: 'relative' }} key={banner.id}>
            <img src={banner.imgUrl} alt={banner.gotoId} style={{ width: '100%' }} />
            <LongMenu banner={banner} deleteBanner={deleteBanner} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
