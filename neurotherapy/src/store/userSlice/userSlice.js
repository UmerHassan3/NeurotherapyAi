import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  users: [],
  loading: false,
  error: null,
};

export const addContact = createAsyncThunk(
  "contact/add",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/contact/add", formData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Cannot add contact" }
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder.addCase(addContact.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(addContact.fulfilled, (state, action) => {
      state.loading = false;
      state.users = action.payload?.data || action.payload;
    });

    builder.addCase(addContact.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "Request failed";
    });
  },
});

export default userSlice.reducer;