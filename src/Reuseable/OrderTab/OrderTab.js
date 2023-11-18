import { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import OrderTable from './OrderTable';

import { db } from '../../services/firebase';

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

export default function OrderTab() {
  const [value, setValue] = useState(0);

  const [orders, setOrders] = useState({
    all: [],
    booked: [],
    dispatched: [],
    delivered: [],
    cancelled: [],
  });

  useEffect(() => {
    const getData = async () => {
      console.log('getData');
      const q = query(collection(db, 'orders'));

      const querySnapshot = await getDocs(q);

      const orderList = {
        all: [],
        booked: [],
        dispatched: [],
        delivered: [],
        cancelled: [],
      };

      console.log('getData1', orderList);

      querySnapshot.forEach((doc) => {
        const newData = {
          id: doc.id,
          ...doc.data(),
        };

        orderList.all.push(newData);
        if (newData.status === 'booked') {
          orderList.booked.push(newData);
        } else if (newData.status === 'dispatched') {
          orderList.dispatched.push(newData);
        } else if (newData.status === 'delivered') {
          orderList.delivered.push(newData);
        } else if (newData.status === 'cancelled') {
          orderList.cancelled.push(newData);
        }
      });

      console.log('getData2', orderList);
      setOrders(orderList);
    };

    getData();
  }, []);

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
          <Tab sx={tab} label="All" {...a11yProps(0)} />
          <Tab sx={tab} label="Booked" {...a11yProps(1)} />
          <Tab sx={tab} label="Dispatched" {...a11yProps(2)} />
          <Tab sx={tab} label="Delivered" {...a11yProps(3)} />
          <Tab sx={tab} label="Cancelled" {...a11yProps(4)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <OrderTable orders={orders.all} type="all" />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <OrderTable orders={orders.booked} type="booked" />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <OrderTable orders={orders.inProgress} type="dispatched" />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <OrderTable orders={orders.delivered} type="delivered" />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <OrderTable orders={orders.cancelled} type="cancelled" />
      </TabPanel>
    </Box>
  );
}
