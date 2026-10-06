import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { DEFAULT_DELIVERY_CHARGE, DEFAULT_LOGISTIC_PARTNERS } from '../utils/logistics';
import { DEFAULT_PREORDER_MAX_QTY } from '../utils/preorder';

// app/meta is shared with the customer website (genre, delivery charge, logistic partners)
const metaRef = () => doc(db, 'app', 'meta');

const getStoreSettings = async () => {
  const docSnap = await getDoc(metaRef());
  const data = docSnap.exists() ? docSnap.data() : {};
  return {
    deliveryCharge: Number.isFinite(data.delivery_charge) ? data.delivery_charge : DEFAULT_DELIVERY_CHARGE,
    logisticPartners: Array.isArray(data.logistic_partners) ? data.logistic_partners : DEFAULT_LOGISTIC_PARTNERS,
    preorderMaxQty:
      Number.isInteger(data.preorder_max_qty) && data.preorder_max_qty > 0
        ? data.preorder_max_qty
        : DEFAULT_PREORDER_MAX_QTY,
  };
};

const updateDeliveryCharge = (deliveryCharge) => updateDoc(metaRef(), { delivery_charge: deliveryCharge });

const updatePreorderMaxQty = (preorderMaxQty) => updateDoc(metaRef(), { preorder_max_qty: preorderMaxQty });

// partners list is small, so the whole list is saved (also saves the default partners on first change)
const addLogisticPartner = async (partner) => {
  const { logisticPartners } = await getStoreSettings();
  const isAlreadyAdded = logisticPartners.some((item) => item.name.toLowerCase() === partner.name.toLowerCase());
  const updatedPartners = isAlreadyAdded
    ? logisticPartners.map((item) => (item.name.toLowerCase() === partner.name.toLowerCase() ? partner : item))
    : [...logisticPartners, partner];
  await updateDoc(metaRef(), { logistic_partners: updatedPartners });
  return updatedPartners;
};

const removeLogisticPartner = async (partner) => {
  const { logisticPartners } = await getStoreSettings();
  const updatedPartners = logisticPartners.filter((item) => item.name !== partner.name);
  await updateDoc(metaRef(), { logistic_partners: updatedPartners });
  return updatedPartners;
};

export { getStoreSettings, updateDeliveryCharge, updatePreorderMaxQty, addLogisticPartner, removeLogisticPartner };
