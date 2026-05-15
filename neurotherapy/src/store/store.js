import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/authSlice/authSlice"
import adminReducer from "../store/adminSlice/adminSlice"
import userReducer from "../store/userSlice/userSlice"

const store = configureStore({
    reducer: {
        auth: authReducer,
        admin: adminReducer,
        user: userReducer,
    }
})

export default store;