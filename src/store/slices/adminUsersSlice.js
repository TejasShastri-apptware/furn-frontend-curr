import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';

// ── Thunks ──────────────────────────────────────────────────────

export const fetchOrgUsers = createAsyncThunk(
    'adminUsers/fetchOrgUsers',
    async (_, { rejectWithValue }) => {
        try {
            return await authApi.getOrgUsers();
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const createAdminUser = createAsyncThunk(
    'adminUsers/createUser',
    async (userData, { rejectWithValue }) => {
        try {
            return await authApi.register(userData);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteAdminUser = createAsyncThunk(
    'adminUsers/deleteUser',
    async (userId, { rejectWithValue }) => {
        try {
            await authApi.deleteOrgUser(userId);
            return userId;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

// ── Slice ────────────────────────────────────────────────────────

const adminUsersSlice = createSlice({
    name: 'adminUsers',
    initialState: {
        users: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearAdminUsersError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrgUsers.pending, (state) => {
                state.loading = true; state.error = null;
            })
            .addCase(fetchOrgUsers.fulfilled, (state, action) => {
                state.loading = false; state.users = action.payload;
            })
            .addCase(fetchOrgUsers.rejected, (state, action) => {
                state.loading = false; state.error = action.payload;
            });

        builder
            .addCase(deleteAdminUser.fulfilled, (state, action) => {
                state.users = state.users.filter(u => u.user_id !== action.payload);
            })
            .addCase(deleteAdminUser.rejected, (state, action) => {
                state.error = action.payload;
            });

        // After creating a user, re-fetch the full list since backend
        // returns auth response, not a user object with role info
        builder
            .addCase(createAdminUser.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearAdminUsersError } = adminUsersSlice.actions;

// ── Selectors ────────────────────────────────────────────────────
export const selectAdminUsers = (state) => state.adminUsers.users;
export const selectAdminUsersLoading = (state) => state.adminUsers.loading;
export const selectAdminUsersError = (state) => state.adminUsers.error;

export default adminUsersSlice.reducer;
