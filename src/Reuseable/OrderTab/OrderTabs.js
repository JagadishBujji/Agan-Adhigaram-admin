import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import OrderTable from './OrderTable';
import OrderTab from './OrderTab';
import { db } from 'src/services/firebase';
import classes from './Ordertabs.module.css';

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

export default function OrderTabs() {
  const [value, setValue] = useState(0);
  const [orders, setOrders] = useState({
    all: { booked: [], inProgress: [], delivered: [], cancelled: [] },
    superfast: { booked: [], inProgress: [], delivered: [], cancelled: [] },
    normal: { booked: [], inProgress: [], delivered: [], cancelled: [] },
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const q = query(collection(db, 'orders'), where('timestamp', '>=', startOfToday), orderBy('timestamp'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const arr = {
          all: { booked: [], inProgress: [], delivered: [], cancelled: [] },
          superfast: { booked: [], inProgress: [], delivered: [], cancelled: [] },
          normal: { booked: [], inProgress: [], delivered: [], cancelled: [] },
        };
        querySnapshot.docChanges().forEach((change) => {
          const doc = {
            id: change.doc.id,
            ...change.doc.data(),
          };
          if (change.type === 'added') {
            console.log('New Product: ', doc);
          }
          if (change.type === 'modified') {
            console.log('Modified Product: ', doc);
          }
          if (change.type === 'removed') {
            console.log('Removed Product: ', doc);
          }
          // filter
          if (doc.status === 'booked') {
            arr.all.booked.push(doc);
            if (doc.type === 'superfast') {
              arr.superfast.booked.push(doc);
            } else {
              arr.normal.booked.push(doc);
            }
          } else if (doc.status === 'inProgress') {
            // remove from booked and add it to inProgress
            arr.all.inProgress.push(doc);
            if (doc.type === 'superfast') {
              arr.superfast.inProgress.push(doc);
            } else {
              arr.normal.inProgress.push(doc);
            }
          } else if (doc.status === 'delivered') {
            // remove from inProgress and add it to delivered
            arr.all.delivered.push(doc);
            if (doc.type === 'superfast') {
              arr.superfast.delivered.push(doc);
            } else {
              arr.normal.delivered.push(doc);
            }
          } else if (doc.status === 'cancelled') {
            arr.all.cancelled.push(doc);
            if (doc.type === 'superfast') {
              arr.superfast.cancelled.push(doc);
            } else {
              arr.normal.cancelled.push(doc);
            }
          }
        });
        setOrders(arr);
      },
      (error) => {
        console.log('Orders Snapshot err:', error);
      }
    );

    // unsubscribe when logout
    return () => {
      console.log('unsubsribe');
      unsubscribe();
    };
  }, []);

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
    '&.css-1p30j7e': {
      display: 'none',
    },
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab sx={tab} label="All Orders" {...a11yProps(0)} />
          {/* <Tab sx={tab} label="Super Fast Delivery (1 Hour)" {...a11yProps(1)} />
          <Tab sx={tab} label="Tomorrow Delivery" {...a11yProps(2)} /> */}
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <OrderTab orders={orders.all} />
      </TabPanel>
    </Box>
  );
}
