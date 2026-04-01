import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';

const ORG_SLUG = 'Furn';

// ── Thunks ──────────────────────────────────────────────────────
export const resolveOrg = createAsyncThunk(
    'auth/resolveOrg',
    async (_, { rejectWithValue }) => {
        try {
            const data = await authApi.resolveOrg(ORG_SLUG);
            if (!data.org_id) throw new Error('Organization not found');

            localStorage.setItem('org_id', String(data.org_id));
            localStorage.setItem('org_name', data.org_name);

            return { orgId: String(data.org_id), orgName: data.org_name };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { getState, rejectWithValue }) => {
        const { orgId } = getState().auth;
        if (!orgId) {
            return rejectWithValue('Organization not resolved yet. Please wait a moment and try again.');
        }

        try {
            const data = await authApi.login(email, password);
            const match = data.user;

            if (String(match.org_id) !== String(orgId)) {
                throw new Error('Account does not belong to this organization');
            }

            const userData = {
                user_id: match.user_id,
                full_name: match.full_name,
                email: match.email,
                role_name: match.role_name,
                org_id: String(match.org_id),
            };

            localStorage.setItem('user_id', String(userData.user_id));
            localStorage.setItem('auth_user', JSON.stringify(userData));

            return userData;
        } catch (error) {
            return rejectWithValue(error.message || 'Login failed. Please try again.');
        }
    }
);

// ── Initial State ────────────────────────────────────────────────
const initialState = {
    user: (() => {
        const saved = localStorage.getItem('auth_user');
        return saved ? JSON.parse(saved) : null;
    })(),
    orgId: localStorage.getItem('org_id'),
    orgName: localStorage.getItem('org_name') || '',
    orgLoading: !localStorage.getItem('org_id'),
    orgError: null,
};

// ── Slice ────────────────────────────────────────────────────────
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('user_id');
            localStorage.removeItem('auth_user');
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(resolveOrg.pending, (state) => {
                state.orgLoading = true;
                state.orgError = null;
            })
            .addCase(resolveOrg.fulfilled, (state, action) => {
                state.orgLoading = false;
                state.orgId = action.payload.orgId;
                state.orgName = action.payload.orgName;
            })
            .addCase(resolveOrg.rejected, (state, action) => {
                state.orgLoading = false;
                state.orgError = action.payload;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;

// ── Selectors ────────────────────────────────────────────────────
export const selectUser = (state) => state.auth.user;
export const selectOrgId = (state) => state.auth.orgId;
export const selectOrgName = (state) => state.auth.orgName;
export const selectOrgLoading = (state) => state.auth.orgLoading;
export const selectOrgError = (state) => state.auth.orgError;
export const selectIsAdmin = (state) => {
    const role = state.auth.user?.role_name;
    return role === 'admin' || role === 'org_level_access' || role === 'dev';
};

export default authSlice.reducer;
