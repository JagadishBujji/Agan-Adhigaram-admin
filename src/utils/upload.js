// a stuck upload (bad network) never settles, which left the save spinner on forever;
// failing after a while lets the existing catch blocks show an error and stop the spinner
const UPLOAD_TIMEOUT_MS = 60000;

const withTimeout = (promise, ms = UPLOAD_TIMEOUT_MS, message = 'Image upload is taking too long. Please check your internet and try again.') => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const MAX_BOOK_IMAGES = 6;

// adds new images to the list without going over the limit; returns the list and whether some were dropped
const addImagesWithinLimit = (current, added, max = MAX_BOOK_IMAGES) => {
  const room = Math.max(max - current.length, 0);
  return { images: [...current, ...added.slice(0, room)], dropped: added.length > room };
};

export { withTimeout, addImagesWithinLimit, MAX_BOOK_IMAGES, UPLOAD_TIMEOUT_MS };
