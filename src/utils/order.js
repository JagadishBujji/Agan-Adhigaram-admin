// The website saves an order as "booked" before the customer pays, so an order
// whose payment did not go through still says booked: use these to tell them apart.

export const isPaid = (order) => order.payment_status === 'PAYMENT_SUCCESS';

// label for an order that was never paid
export const getUnpaidLabel = (order) => {
  if (order.payment_status === 'PAYMENT_INITIATED' || order.payment_status === 'PAYMENT_PENDING') {
    return 'PAYMENT NOT COMPLETED';
  }
  return 'PAYMENT FAILED';
};

// short number (AA1001) for orders paid since it was added, the long id for older ones
export const displayOrderId = (order) => order.order_number || order.id;
