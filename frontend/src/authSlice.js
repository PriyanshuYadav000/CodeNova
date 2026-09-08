import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(
        '/user/register',
        userData
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: 'Unable to register. Please try again.',
        }
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(
        '/user/login',
        credentials
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: 'Unable to login. Please try again.',
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
          message: 'Not authenticated',
        });
      }

      return rejectWithValue(
        error.response?.data || {
          message: 'Unable to verify authentication.',
        }
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(
        '/user/profile',
        profileData
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: 'Unable to update profile.',
        }
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(
        '/user/password',
        passwordData
      );

      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: 'Unable to change password.',
        }
      );
    }
  }
);

export const deleteProfile = createAsyncThunk(
  'auth/deleteProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.delete(
        '/user/deleteProfile'
      );

      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: 'Unable to delete profile.',
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
          message: 'Unable to logout. Please try again.',
        }
      );
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  authChecked: false,
  registerLoading: false,
  loginLoading: false,
  checkLoading: false,
  profileLoading: false,
  passwordLoading: false,
  deleteLoading: false,
  logoutLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.registerLoading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registerLoading = false;
        state.user = action.payload;
        state.isAuthenticated = Boolean(action.payload);
        state.error = null;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.registerLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error =
          action.payload?.message ||
          'Something went wrong during registration.';
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.loginLoading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.loginLoading = false;
        state.user = action.payload;
        state.isAuthenticated = Boolean(action.payload);
        state.error = null;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.loginLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error =
          action.payload?.message ||
          'Something went wrong during login.';
      })

      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.checkLoading = true;
        state.error = null;
      })

      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.checkLoading = false;
        state.authChecked = true;
        state.user = action.payload;
        state.isAuthenticated = Boolean(action.payload);
        state.error = null;
      })

      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.checkLoading = false;
        state.authChecked = true;
        state.user = null;
        state.isAuthenticated = false;

        if (
          action.payload?.code === 'AUTHENTICATION_ERROR'
        ) {
          state.error = null;
        } else {
          state.error =
            action.payload?.message ||
            'Unable to verify authentication.';
        }
      })

      .addCase(updateProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })

      .addCase(updateProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error =
          action.payload?.message ||
          'Unable to update profile.';
      })

      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true;
        state.error = null;
      })

      .addCase(changePassword.fulfilled, (state) => {
        state.passwordLoading = false;
        state.error = null;
      })

      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.error =
          action.payload?.message ||
          'Unable to change password.';
      })

      .addCase(deleteProfile.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })

      .addCase(deleteProfile.fulfilled, (state) => {
        state.deleteLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      .addCase(deleteProfile.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error =
          action.payload?.message ||
          'Unable to delete profile.';
      })

      .addCase(logoutUser.pending, (state) => {
        state.logoutLoading = true;
        state.error = null;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.logoutLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error =
          action.payload?.message ||
          'Unable to logout. Please try again.';
      });
  },
});

export default authSlice.reducer;