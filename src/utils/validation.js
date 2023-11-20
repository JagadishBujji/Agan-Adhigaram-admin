const isNumeric = (value) => {
  return /^\d+$/.test(value);
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

function isValidEmail(email) {
  // Regular expression for a valid email address
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  // Test the email against the regex pattern
  return emailRegex.test(email);
}

function isValidPassword(password) {
  // Password must be 6 characters or more in length
  const passwordRegex = /^.{6,}$/;

  // Test the password against the regex pattern
  return passwordRegex.test(password);
}

function isValidName(name) {
  const nameRegex = /^[A-Za-z\s'-]+$/;

  return name && name.trim() !== '' && nameRegex.test(name);
}

function isValidDate(date) {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

export { isValidEmail, isValidPassword, isValidName, isValidDate };

export { isNumeric, areArraysEqual, validatePincode };
