// logistic partners shown by default, admin can add more from settings or while dispatching
export const DEFAULT_LOGISTIC_PARTNERS = [
  { name: 'ST Courier', tracking_url: 'https://stcourier.com/track/shipment' },
  {
    name: 'India Post',
    tracking_url: 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx',
  },
];

export const DEFAULT_DELIVERY_CHARGE = 50;

// old orders have the logistic name stored as key
const LEGACY_LOGISTIC_NAMES = {
  stcourier: 'ST Courier',
  indiapost: 'India Post',
};

export const getLogisticName = (logistics) => {
  if (!logistics || !logistics.name) return '';
  return LEGACY_LOGISTIC_NAMES[logistics.name] || logistics.name;
};

export const formatLogistics = (logistics) => {
  const name = getLogisticName(logistics);
  if (!name) return 'NIL';
  return logistics.number ? `${name} - ${logistics.number}` : name;
};

export const isValidUrl = (url) => /^https?:\/\/\S+\.\S+/i.test(url);
