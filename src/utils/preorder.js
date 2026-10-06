// Pre-order - only for new books before the release, admin switches it off once the book is released
export const DEFAULT_PREORDER_MAX_QTY = 5;

// timestamp -> value for the date input (yyyy-mm-dd)
export const toDateInputValue = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (num) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const formatDate = (timestamp) =>
  timestamp ? new Date(timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

// pre-order fields stored in the book doc, date input value is stored as timestamp
export const getPreorderFields = (book) => {
  const isPreorder = Boolean(book.is_preorder);
  return {
    is_preorder: isPreorder,
    expected_delivery_date:
      isPreorder && book.expected_delivery_date ? new Date(book.expected_delivery_date).getTime() : null,
    preorder_remark: isPreorder ? (book.preorder_remark || '').trim() : '',
  };
};

// returns the error message, empty when the pre-order details are valid
export const validatePreorder = (book) => {
  if (!book.is_preorder) return '';
  const date = new Date(book.expected_delivery_date);
  if (!book.expected_delivery_date || Number.isNaN(date.getTime())) {
    return 'Please select the expected delivery date for the pre-order book';
  }
  return '';
};
