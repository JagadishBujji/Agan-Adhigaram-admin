import { createSlice } from "@reduxjs/toolkit";

const initialState={
    userDetails:{
        id: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        role: "",
    },
    isAuthenticated:false
}

export const userSlice=createSlice({
    name:"user",
    initialState,
    reducers:{
        login:(state,action)=>{
            state.userDetails=action.payload;
            state.isAuthenticated=true;
        },
        logout:(state)=>{
            state.userDetails = {
                id: "",
                name: "",
                email: "",
                phone: "",
                address: "",
                role: "",
              };
              state.isAuthenticated = false;
        }
    }
})

export const { login, logout } = userSlice.actions;

export const selectUser = (state) => state.user;
export const selectUserDetail = (state) => state.user.userDetail;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;

export default userSlice.reducer;