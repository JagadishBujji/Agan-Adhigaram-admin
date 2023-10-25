const isNumeric = (value) => {
  return /^([1-9]\d*|0)(\.\d+)?$/.test(value);
};

const areArraysEqual = (arr1, arr2) => {
  console.log('check', arr1, arr2);
  // Check if the lengths of the arrays are equal
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Check if each element of arr1 is included in arr2
  return arr1.every((item) => arr2.includes(item));
};

const validatePincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/; // Regex pattern to match a 6-digit pincode starting from 1-9
  return pincodeRegex.test(pincode);
};

export { isNumeric, areArraysEqual, validatePincode };
