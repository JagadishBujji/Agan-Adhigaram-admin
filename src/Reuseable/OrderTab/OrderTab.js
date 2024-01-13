import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import OrderTable from './OrderTable';

import { db } from '../../services/firebase';
import { setOrders, selectOrders } from '../../store/orderSlice';

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
  const dispatch = useDispatch();
  const { orders } = useSelector(selectOrders);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const getData = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const thirtyDaysAgoTimestamp = thirtyDaysAgo.getTime();

      const q = query(
        collection(db, 'orders'),
        where('payment_status', '==', 'PAYMENT_SUCCESS'),
        where('ordered_timestamp', '>=', thirtyDaysAgoTimestamp),
        orderBy('ordered_timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);

      const orderList = {
        all: [],
        booked: [],
        dispatched: [],
        delivered: [],
        cancelled: [],
      };

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

      console.log('getData: ', orderList);
      dispatch(setOrders(orderList));
    };

    getData();
  }, []);

  const updateOrders = (id, updatedData) => {
    const allOrders = [...orders.all];
    const index = allOrders.findIndex((order) => order.id === id);

    allOrders[index] = {
      ...allOrders[index],
      ...updatedData,
    };

    const orderList = {
      all: [],
      booked: [],
      dispatched: [],
      delivered: [],
      cancelled: [],
    };

    allOrders.forEach((data) => {
      orderList.all.push(data);
      if (data.status === 'booked') {
        orderList.booked.push(data);
      } else if (data.status === 'dispatched') {
        orderList.dispatched.push(data);
      } else if (data.status === 'delivered') {
        orderList.delivered.push(data);
      } else if (data.status === 'cancelled') {
        orderList.cancelled.push(data);
      }
    });

    dispatch(setOrders(orderList));
  };

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
        <OrderTable orders={orders.all} type="all" updateOrders={updateOrders} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <OrderTable orders={orders.booked} type="booked" updateOrders={updateOrders} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <OrderTable orders={orders.dispatched} type="dispatched" updateOrders={updateOrders} />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <OrderTable orders={orders.delivered} type="delivered" updateOrders={updateOrders} />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <OrderTable orders={orders.cancelled} type="cancelled" updateOrders={updateOrders} />
      </TabPanel>
    </Box>
  );
}
