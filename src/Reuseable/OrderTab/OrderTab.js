import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import OrderTable from './OrderTable';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function OrderTab({ orders }) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tab = {
    // fontWeight: '700',
    // background: '#9F3239',
    // color: '#fff',
    // outline: 'none',
    // borderRadius: '5px',
    // fontFamily: 'sans-serif',
    // fontSize: '16px',
    // borderBottom: 'none',
    '&.Mui-selected': {
      fontWeight: '700',
      background: '#F19E38',
      color: '#fff',
      outline: 'none',
      borderRadius: '5px',
      fontFamily: 'sans-serif',
      fontSize: '16px',
      borderBottom: 'none',
    },
    '&.css-6d3pg0-MuiTabs-indicator': {
      background: 'none!important',
    },
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab sx={tab} label="Booked" {...a11yProps(0)} />
          <Tab sx={tab} label="Dispatched" {...a11yProps(1)} />
          <Tab sx={tab} label="Delivered" {...a11yProps(2)} />
          <Tab sx={tab} label="Cancelled" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <OrderTable orders={orders.booked} type="booked" />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <OrderTable orders={orders.inProgress} type="inProgress" />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <OrderTable orders={orders.delivered} type="delivered" />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <OrderTable orders={orders.cancelled} type="cancelled" />
      </TabPanel>
    </Box>
  );
}
