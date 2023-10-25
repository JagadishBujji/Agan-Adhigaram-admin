import { Button, Container } from '@mui/material';
import Typography from '@mui/material/Typography';
import DistrictTable from '../Reuseable/Districts/DistrictTable';
import classes from './District.module.css';
import { useEffect, useState } from 'react';
import DistrictModal from 'src/Reuseable/Modal/DistrictModal';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import axios from 'axios';
import { validatePincode } from '../utils/validation';

const District = () => {
  const [districts, setDistricts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [chips, setChips] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [district, setDistrict] = useState('');
  const [isAvailable, setIsAvailable] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [superDeliveryCharge, setSuperDeliveryCharge] = useState(0);
  const [msg, setMsg] = useState('');
  // isEdit -> whether to edit or create it new

  useEffect(() => {
    const getDistricts = async () => {
      const querySnapshot = await getDocs(collection(db, 'availableDistricts'));
      const arr = [];
      querySnapshot.forEach((doc) => {
        arr.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      // console.log('arr: ', arr);
      setDistricts(arr);
    };

    getDistricts();
  }, []);

  const openModal = () => {
    setShowModal(true);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const closeModal = () => {
    setChips([]);
    setInputValue('');
    setDistrict('');
    setIsAvailable('');
    setDeliveryCharge(0);
    setSuperDeliveryCharge(0);
    setMsg('');
    setShowModal(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === ' ' || event.key === ',' || event.key === 'Enter') {
      const trimmedValue = inputValue.trim();

      if (trimmedValue !== '') {
        if (trimmedValue.length === 6 && validatePincode(trimmedValue)) {
          axios
            .get(`https://api.postalpincode.in/pincode/${trimmedValue}`)
            .then((result) => {
              const data = result.data[0];
              console.log('api', data);
              if (data.Status === 'Success') {
                const firstPostOffice = data.PostOffice[0];
                setDistrict((prevState) => {
                  if (prevState !== '') {
                    if (prevState !== firstPostOffice.District) {
                      alert(
                        `Give pincode for ${prevState} district. Your current [${trimmedValue}] is in ${firstPostOffice.District} district.`
                      );
                      return prevState;
                    }
                    setChips([...chips, trimmedValue]);
                    setInputValue('');
                    return prevState;
                  } else {
                    const index = districts.findIndex((dist) => dist.id === firstPostOffice.District);
                    if (index === -1) {
                      setChips([...chips, trimmedValue]);
                      setInputValue('');
                      return firstPostOffice.District;
                    } else {
                      alert('District already available, please edit, instead of creating newly.');
                    }
                  }
                });
              } else if (data.Status === 'Error') {
                alert('No Record Found, contact developer for further details.');
              }
            })
            .catch((e) => {
              console.log(e);
              alert('Some error, try after sometime or contact Developer');
            });
        } else {
          alert('Enter valid pincode');
        }
      }

      event.preventDefault();
    }
  };

  const handleDeleteChip = (index) => {
    setChips(chips.filter((_, chipIndex) => chipIndex !== index));
  };

  const handleIsAvailable = (e) => {
    setIsAvailable(e.target.value);
  };

  const handleSuperDeliveryCharge = (e) => {
    setSuperDeliveryCharge(e.target.value);
  };

  const handleDeliveryCharge = (e) => {
    setDeliveryCharge(e.target.value);
  };

  const handleMessage = (e) => {
    setMsg(e.target.value);
  };

  const saveHandler = () => {
    chips.sort();
    // console.log(chips, isAvailable, district, superDeliveryCharge, deliveryCharge, msg);
    if (chips.length > 0 && isAvailable && district && msg) {
      const newDistrict = {
        availablePincodes: chips,
        deliveryCharge: parseFloat(deliveryCharge),
        isAvailable: isAvailable === 'Yes',
        message: msg,
        superFastDeliveryCharge: parseFloat(superDeliveryCharge),
      };
      setDoc(doc(db, 'availableDistricts', district), newDistrict)
        .then(() => {
          console.log('Added new district');
          setDistricts((prevState) => [
            ...prevState,
            {
              ...newDistrict,
              id: district,
            },
          ]);
          closeModal();
          alert('Successfully Added New District.');
        })
        .catch((e) => console.log(e));
    } else {
      alert('Invalid details');
    }
  };

  const handleEditDistrict = (dist) => {
    console.log('edit dist:', dist);
    setDeliveryCharge(dist.deliveryCharge);
    setIsAvailable(dist.isAvailable);
    setMsg(dist.message);
    setSuperDeliveryCharge(dist.superFastDeliveryCharge);
    setDistrict(dist.id);
    setChips([dist.availablePincodes]);
    openModal();
  };

  return (
    <Container>
      <div className={classes.districtHeader} style={{ marginBottom: '10px' }}>
        <Typography variant="h4">Districts</Typography>
        <Button variant="contained" className={classes.districtBtn} onClick={openModal}>
          Add District/pincode
        </Button>
      </div>
      {showModal && (
        <DistrictModal
          open={showModal}
          close={closeModal}
          chips={chips}
          inputValue={inputValue}
          handleInputChange={handleInputChange}
          handleKeyPress={handleKeyPress}
          handleDeleteChip={handleDeleteChip}
          district={district}
          isAvailable={isAvailable}
          handleIsAvailable={handleIsAvailable}
          superDeliveryCharge={superDeliveryCharge}
          handleSuperDeliveryCharge={handleSuperDeliveryCharge}
          deliveryCharge={deliveryCharge}
          handleDeliveryCharge={handleDeliveryCharge}
          msg={msg}
          handleMessage={handleMessage}
          saveHandler={saveHandler}
        />
      )}
      <DistrictTable districts={districts} openModal={handleEditDistrict} />
    </Container>
  );
};
export default District;
