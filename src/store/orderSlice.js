import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: {
    all: [],
    booked: [],
    dispatched: [],
    delivered: [],
    cancelled: [],
  },
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
  },
});

export const { setOrders } = orderSlice.actions;

export const selectOrders = (state) => state.order;
export const selectOrdersStat = (state) => ({
  all: state.order.orders.all.length,
  booked: state.order.orders.booked.length,
  dispatched: state.order.orders.dispatched.length,
  delivered: state.order.orders.delivered.length,
  cancelled: state.order.orders.cancelled.length,
});

export default orderSlice.reducer;
