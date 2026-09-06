import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/register', userData);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: 'Unable to register. Please try again.'
        }
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: 'Unable to login. Please try again.'
        }
      );
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/user/check');

      return response.data.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue({
          code: 'AUTHENTICATION_ERROR',
          message: 'Not authenticated'
        });
      }

      return rejectWithValue(
        error.response?.data || {
          message: 'Unable to verify authentication.'
        }
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(
        "/user/profile",
        profileData
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Unable to update profile."
        }
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(
        "/user/password",
        passwordData
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Unable to change password."
        }
      );
    }
  }
);

export const deleteProfile = createAsyncThunk(
  "auth/deleteProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.delete(
        "/user/deleteProfile"
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Unable to delete profile."
        }
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/logout');

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: 'Unable to logout. Please try again.'
        }
      );
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // ==========================================
      // REGISTER
      // ==========================================

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = Boolean(action.payload);
        state.error = null;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error =
          action.payload?.message ||
          'Something went wrong during registration.';
      })

      // ==========================================
      // LOGIN
      // ==========================================

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = Boolean(action.payload);
        state.error = null;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error =
          action.payload?.message ||
          'Something went wrong during login.';
      })

      // ==========================================
      // CHECK AUTH
      // ==========================================

      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = Boolean(action.payload);
        state.error = null;
      })

      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;

        // A 401 simply means there is no active session.
        if (action.payload?.code === 'AUTHENTICATION_ERROR') {
          state.error = null;
        } else {
          state.error =
            action.payload?.message ||
            'Unable to verify authentication.';
        }
      })

      // ==========================================
      // UPDATE PROFILE
      // ==========================================

      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })

      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          'Unable to update profile.';
      })

      // ==========================================
      // CHANGE PASSWORD
      // ==========================================

      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })

      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          'Unable to change password.';
      })

      // ==========================================
      // DELETE PROFILE
      // ==========================================

      .addCase(deleteProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteProfile.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          'Unable to delete profile.';
      })

      // ==========================================
      // LOGOUT
      // ==========================================

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;

        // The session should be considered gone
        // even if the logout request itself fails.
        state.user = null;
        state.isAuthenticated = false;

        state.error =
          action.payload?.message ||
          'Unable to logout. Please try again.';
      });
  }
});

export default authSlice.reducer; 