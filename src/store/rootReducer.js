import { combineReducers } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import orderSlice from './orderSlice';

const rootReducer = combineReducers({
  user: userSlice,
  order: orderSlice,
});

export default rootReducer;
