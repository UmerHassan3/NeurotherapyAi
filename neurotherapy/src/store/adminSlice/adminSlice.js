import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { addContact } from "../userSlice/UserSlice";

const initialState = {
    Users: [],
    loading: false,
    Contact: [],
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

export const getContacts = createAsyncThunk(
    "/admin/users/contact/get",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get("/api/admin/users/contact/get");
            return res.data;
        } catch (error) {
            return rejectWithValue(
                err.response?.data || { message: "Failed to fetch contacts" }
            );
        }
    }
)

export const deleteContact = createAsyncThunk(
    "/admin/users/contact/delete",
    async (id, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`/api/admin/users/contact/delete/${id}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(
                err.response?.data || { message: "Failed to delete contacts" }
            );
        }
    }
)

export const sendReply = createAsyncThunk(
    "/admin/users/contact/reply",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post("/api/admin/users/contact/reply", formData);
            return res.data;
        } catch (error) {
            return rejectWithValue(
                err.response?.data || { message: "Failed to reply" }
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
            })

            .addCase(getContacts.pending, (state) => {
                state.Contact = [];
                state.loading = true;
            })
            .addCase(getContacts.fulfilled, (state, action) => {
                state.Contact = action.payload.data;
                state.loading = false;
            })
            .addCase(getContacts.rejected, (state) => {
                state.Contact = [];
                state.loading = true;
            })
    },
});

export default adminSlice.reducer;