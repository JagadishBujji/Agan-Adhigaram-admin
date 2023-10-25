import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import HomeBanner from '../../sections/@dashboard/Setting/HomeBanner';
import Maintainance from '../../sections/@dashboard/Setting/Maintenance';
import { db, storage } from '../../services/firebase';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

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

export default function SettingsTabs() {
  const [value, setValue] = useState(0);
  const [settings, setSettings] = useState({
    homeBanner: [
      {
        id: '',
        gotoId: '',
        gotoType: '',
        imgUrl: '',
      },
    ],
    maintenance: {
      enabled: false,
      message: 'The Daily Meat App is under maintenance. Please check in after some time.',
    },
  });

  useEffect(() => {
    const settingsRef = doc(db, 'appMeta', 'settings');
    getDoc(settingsRef)
      .then((doc) => {
        const result = doc.data();
        // console.log('setting:', result);
        setSettings(result);
      })
      .catch((e) => console.log('Getting Settings:', e));
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const addNewBanner = (banner, image, setIsSuccess) => {
    // console.log('addNew:', banner, image, image.name);
    // upload image to storage
    const storageRef = ref(storage, `banners/${image.name}`);
    uploadBytes(storageRef, image)
      .then(() => getDownloadURL(storageRef))
      .then((url) => {
        const newBanner = {
          ...banner,
          imgUrl: url,
        };
        // add the new banner to homeBanner array
        // console.log('newBanner:', newBanner);
        const docRef = doc(db, 'appMeta', 'settings');
        updateDoc(docRef, {
          homeBanner: arrayUnion(newBanner),
        })
          .then(() => {
            console.log('Object added successfully');
            setSettings((prevState) => {
              const homeBanner = [...prevState.homeBanner];
              homeBanner.push(newBanner);
              return {
                ...prevState,
                homeBanner,
              };
            });
            setIsSuccess(true);
            alert('Banner added successfully!!!');
          })
          .catch((error) => {
            console.error('Error adding object:', error);
          });
      })
      .catch((e) => console.log('img upload err:', e));
  };

  // const updateBanner = (banner) => {
  //   const docRef = doc(db, 'appMeta', 'settings');
  //   updateDoc(docRef, {
  //     homeBanner: arrayRemove(banner),
  //   })
  //     .then(() => {
  //       console.log('Object removed successfully');
  //     })
  //     .catch((error) => {
  //       console.error('Error removing object:', error);
  //     });
  // };

  const deleteBanner = (banner) => {
    console.log('banner:', banner);
    // have loaders/spinners

    const docRef = doc(db, 'appMeta', 'settings');
    updateDoc(docRef, {
      homeBanner: arrayRemove(banner),
    })
      .then(() => {
        // console.log('Object removed successfully');
        // Delete the image from Firebase Storage
        const storageRef = ref(getStorage(), banner.imgUrl);
        deleteObject(storageRef)
          .then(() => {
            console.log('Image deleted successfully');
          })
          .catch((error) => {
            console.error('Error deleting image:', error);
          });
        alert('Banner Removed Successfully.');
        setSettings((prevState) => {
          const homeBanner = [...prevState.homeBanner];
          const index = homeBanner.findIndex((hBanner) => hBanner.id === banner.id);
          homeBanner.splice(index, 1);
          return {
            ...prevState,
            homeBanner,
          };
        });
      })
      .catch((error) => {
        console.error('Error removing object:', error);
        alert('Network error, try after sometime.');
      });
  };

  const handleMaintenance = (value, type) => {
    // console.log('updateMaintenance:', value, type);
    setSettings((prevState) => {
      if (type === 'status') {
        return {
          ...prevState,
          maintenance: {
            ...prevState.maintenance,
            enabled: value,
          },
        };
      }
      return {
        ...prevState,
        maintenance: {
          ...prevState.maintenance,
          message: value,
        },
      };
    });
  };

  const saveHandler = (isUpdated) => {
    console.log('save:', settings.maintenance);
    const docRef = doc(db, 'appMeta', 'settings');
    updateDoc(docRef, {
      maintenance: settings.maintenance,
    })
      .then(() => {
        console.log('Object added successfully');
        alert('Maintenance details updated successfully!!!');
        isUpdated(true);
      })
      .catch((error) => {
        console.error('Error adding object:', error);
        alert(`Error: ${error.message}`);
      });
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
      background: '#9F3239',
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
          <Tab sx={tab} label="Home Banner" {...a11yProps(0)} />
          <Tab sx={tab} label="Maintenance" {...a11yProps(1)} />
          {/* <Tab label="Item Three" {...a11yProps(2)} /> */}
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <HomeBanner banners={settings.homeBanner} addNewBanner={addNewBanner} deleteBanner={deleteBanner} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Maintainance
          maintenance={settings.maintenance}
          handleMaintenance={handleMaintenance}
          saveHandler={saveHandler}
        />
      </TabPanel>
      {/* <TabPanel value={value} index={2}>
        Item Three
      </TabPanel> */}
    </Box>
  );
}
