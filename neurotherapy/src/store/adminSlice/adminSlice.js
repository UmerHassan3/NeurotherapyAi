import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    Users: [],
    loading: false,
    error: null,
};

export const fetchAllUsers = createAsyncThunk(
    "/admin/users/get",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get("/api/admin/users/get");
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || { message: "Failed to fetch users" }
            );
        }
    }
);

export const deleteUsers = createAsyncThunk(
    "/admin/users/delete",
    async (id, { rejectWithValue }) => {
        try {
            const result = await axios.delete(`/api/admin/users/delete/${id}`);
            return result.data;

        } catch (error) {
            return rejectWithValue(
                err.response?.data || { message: "Failed to fetch users" }
            );
        }
    }
)

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.Users = action.payload?.data || [];
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.Users = [];
                state.error = action.payload?.message || "Error fetching users";
            });
    },
});

export default adminSlice.reducer;