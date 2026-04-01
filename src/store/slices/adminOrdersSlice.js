import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderApi } from '../../api/orderApi';

// ── Thunks ──────────────────────────────────────────────────────

export const fetchOrgOrders = createAsyncThunk(
    'adminOrders/fetchOrgOrders',
    async (_, { rejectWithValue }) => {
        try {
            return await orderApi.getOrgOrders();
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const updateAdminOrderStatus = createAsyncThunk(
    'adminOrders/updateStatus',
    async ({ orderId, status }, { rejectWithValue }) => {
        try {
            await orderApi.updateStatus(orderId, status);
            return { orderId, status };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

// ── Slice ────────────────────────────────────────────────────────

const adminOrdersSlice = createSlice({
    name: 'adminOrders',
    initialState: {
        orders: [],
        loading: false,
        error: null,
    },
    reducers: {
        // Instant local status change (called alongside the thunk for snappy UI)
        localUpdateOrderStatus: (state, action) => {
            const { orderId, status } = action.payload;
            const idx = state.orders.findIndex(o => o.order_id === orderId);
            if (idx !== -1) state.orders[idx].order_status = status;
        },
        clearAdminOrdersError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrgOrders.pending, (state) => {
                state.loading = true; state.error = null;
            })
            .addCase(fetchOrgOrders.fulfilled, (state, action) => {
                state.loading = false; state.orders = action.payload;
            })
            .addCase(fetchOrgOrders.rejected, (state, action) => {
                state.loading = false; state.error = action.payload;
            });

        builder
            .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
                const { orderId, status } = action.payload;
                const idx = state.orders.findIndex(o => o.order_id === orderId);
                if (idx !== -1) state.orders[idx].order_status = status;
            })
            .addCase(updateAdminOrderStatus.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { localUpdateOrderStatus, clearAdminOrdersError } = adminOrdersSlice.actions;

// ── Selectors ────────────────────────────────────────────────────
export const selectAdminOrders = (state) => state.adminOrders.orders;
export const selectAdminOrdersLoading = (state) => state.adminOrders.loading;
export const selectAdminOrdersError = (state) => state.adminOrders.error;

export default adminOrdersSlice.reducer;
