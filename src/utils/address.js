// order.userDetail has the name, phone and address of the delivery address selected by the customer
export const formatAddress = (userDetail) => {
  if (!userDetail) return '';
  const place = [userDetail.address, userDetail.city, userDetail.state, userDetail.country].filter(Boolean).join(', ');
  return userDetail.pincode ? `${place} - ${userDetail.pincode}` : place;
};

// true - order is delivered to a different person than the account holder (gift, office etc.)
export const isDeliveredToOtherPerson = (order) =>
  Boolean(
    order.ordered_by &&
      (order.ordered_by.name !== order.userDetail.name || order.ordered_by.phone !== order.userDetail.phone)
  );
