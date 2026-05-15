import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    User: null,
    isLoading: false,
    error: null,
};

// -------------------
// Helper: normalize user from API
// -------------------
const extractUser = (payload) => {
    return (
        payload?.data?.user ||
        payload?.user ||
        payload?.data ||
        payload ||
        null
    );
};

// -------------------
// Async Thunks
// -------------------

export const SignUpUser = createAsyncThunk(
    "/auth/signup",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                "/api/auth/signup",
                formData,
                { withCredentials: true }
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Cannot Sign Up" });
        }
    }
);

export const SignInUser = createAsyncThunk(
    "/auth/signin",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                "/api/auth/signin",
                formData,
                { withCredentials: true }
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Cannot Sign In" });
        }
    }
);

export const SignOutUser = createAsyncThunk(
    "/auth/signout",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.delete(
                "/api/auth/signout",
                { withCredentials: true }
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Cannot Sign Out" });
        }
    }
);

export const ForgotPass = createAsyncThunk(
    "/auth/forgot-password",
    async (email, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                "/api/auth/forgot-password",
                email
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Cannot Request Password Reset" });
        }
    }
);

export const ResetPass = createAsyncThunk(
    "/auth/resetpassword",
    async ({ token, password }, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                `/api/auth/resetpassword/${token}`,
                password
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Cannot Reset Password" });
        }
    }
);

export const CheckAuth = createAsyncThunk(
    "/auth/checkauth",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(
                "/api/auth/checkauth",
                {
                    withCredentials: true,
                    headers: {
                        "Cache-Control": "no-store",
                    },
                }
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: "Cannot Check Auth" });
        }
    }
);

// -------------------
// Slice
// -------------------

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder

            // -------------------
            // SIGN UP
            // -------------------
            .addCase(SignUpUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(SignUpUser.fulfilled, (state, action) => {
                state.isLoading = false;

                const user = extractUser(action.payload);

                state.User = user;
                state.isAuthenticated = !!user;
            })
            .addCase(SignUpUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.User = null;
                state.error = action.payload?.message || "Sign Up Failed";
            })

            // -------------------
            // SIGN IN
            // -------------------
            .addCase(SignInUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(SignInUser.fulfilled, (state, action) => {
                state.isLoading = false;

                const user = extractUser(action.payload);

                state.User = user;
                state.isAuthenticated = !!user;
            })
            .addCase(SignInUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.User = null;
                state.error = action.payload?.message || "Sign In Failed";
            })

            // -------------------
            // SIGN OUT
            // -------------------
            .addCase(SignOutUser.fulfilled, (state) => {
                state.isAuthenticated = false;
                state.User = null;
                state.error = null;
            })

            // -------------------
            // FORGOT PASSWORD
            // -------------------
            .addCase(ForgotPass.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(ForgotPass.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(ForgotPass.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Forgot Password Failed";
            })

            // -------------------
            // RESET PASSWORD
            // -------------------
            .addCase(ResetPass.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(ResetPass.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(ResetPass.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Reset Password Failed";
            })

            // -------------------
            // CHECK AUTH
            // -------------------
            .addCase(CheckAuth.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(CheckAuth.fulfilled, (state, action) => {
                state.isLoading = false;

                const user = extractUser(action.payload);

                state.User = user;
                state.isAuthenticated = !!user;
            })
            .addCase(CheckAuth.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.User = null;
                state.error = action.payload?.message || "Auth Check Failed";
            });
    },
});

export default authSlice.reducer;