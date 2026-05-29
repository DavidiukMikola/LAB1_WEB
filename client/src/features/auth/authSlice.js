import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { apiRequest, clearSession, getStoredToken, getStoredUser, saveSession } from '../../api/client';

function createInitialState() {
  const token = getStoredToken();
  return {
    token,
    user: getStoredUser(),
    status: 'idle',
    error: null,
    profileStatus: token ? 'idle' : 'idle',
    profileError: null,
  };
}

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials) => {
  return apiRequest('/api/auth/login/', {
    method: 'POST',
    token: null,
    body: credentials,
  });
});

export const registerUser = createAsyncThunk('auth/registerUser', async (payload) => {
  return apiRequest('/api/auth/register/', {
    method: 'POST',
    token: null,
    body: payload,
  });
});

export const loadProfile = createAsyncThunk('auth/loadProfile', async (_, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  return apiRequest('/api/auth/profile/', {
    token: auth.token,
  });
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload, thunkAPI) => {
  const { auth } = thunkAPI.getState();
  return apiRequest('/api/auth/profile/', {
    method: 'PATCH',
    token: auth.token,
    body: payload,
  });
});

const authSlice = createSlice({
  name: 'auth',
  initialState: createInitialState(),
  reducers: {
    logout(state) {
      clearSession();
      state.token = '';
      state.user = null;
      state.status = 'idle';
      state.error = null;
      state.profileStatus = 'idle';
      state.profileError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { token, user } = action.payload;
        saveSession({ token, user });
        state.token = token;
        state.user = user;
        state.status = 'succeeded';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Не вдалося увійти';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const { token, user } = action.payload;
        saveSession({ token, user });
        state.token = token;
        state.user = user;
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Не вдалося зареєструватися';
      })
      .addCase(loadProfile.pending, (state) => {
        state.profileStatus = 'loading';
        state.profileError = null;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        saveSession({ token: state.token, user: action.payload });
        state.profileStatus = 'succeeded';
      })
      .addCase(loadProfile.rejected, (state, action) => {
        state.profileStatus = 'failed';
        state.profileError = action.error.message || 'Не вдалося завантажити профіль';
      })
      .addCase(updateProfile.pending, (state) => {
        state.profileStatus = 'loading';
        state.profileError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        saveSession({ token: state.token, user: action.payload });
        state.profileStatus = 'succeeded';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileStatus = 'failed';
        state.profileError = action.error.message || 'Не вдалося оновити профіль';
      });
  },
});

export const { logout } = authSlice.actions;

export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
export const selectAuthUser = (state) => state.auth.user;

export default authSlice.reducer;
