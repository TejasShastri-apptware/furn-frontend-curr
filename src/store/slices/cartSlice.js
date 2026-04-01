import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '../../api/cartApi';
import { login, logout } from './authSlice';

// ── Thunks ──────────────────────────────────────────────────────
export const refreshCart = createAsyncThunk(
    'cart/refreshCart',
    async (_, { rejectWithValue }) => {
        const userId = localStorage.getItem('user_id');
        const orgId = localStorage.getItem('org_id');
        if (!userId || !orgId) return [];
        try {
            return await cartApi.getCart();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ product_id, quantity = 1 }, { dispatch }) => {
        await cartApi.addToCart(product_id, quantity);
        dispatch(refreshCart());
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (cart_item_id) => {
        await cartApi.removeFromCart(cart_item_id);
        return cart_item_id;
    }
);

export const updateQuantity = createAsyncThunk(
    'cart/updateQuantity',
    async ({ cart_item_id, quantity }, { dispatch, rejectWithValue }) => {
        if (quantity < 1) return rejectWithValue('Quantity must be at least 1');
        try {
            await cartApi.updateQuantity(cart_item_id, quantity);
            dispatch(refreshCart());
        } catch (error) {
            dispatch(refreshCart()); // revert on failure
            return rejectWithValue(error.message);
        }
    }
);

export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { dispatch }) => {
        // The backend clears the cart during order placement via the order API.
        // We just need to refresh after a short delay to let the backend commit.
        await new Promise(r => setTimeout(r, 300));
        dispatch(refreshCart());
    }
);

// ── Initial State ────────────────────────────────────────────────
const initialState = {
    items: [],
    loading: false,
    error: null,
};

// ── Slice ────────────────────────────────────────────────────────
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        resetCart: (state) => {
            state.items = [];
            state.loading = false;
            state.error = null;
        },
        // Synchronous optimistic updates
        updateQuantityOptimistic: (state, action) => {
            const { cart_item_id, quantity } = action.payload;
            const item = state.items.find(i => i.cart_item_id === cart_item_id);
            if (item) {
                item.quantity = quantity;
            }
        },
        removeFromCartOptimistic: (state, action) => {
            const cart_item_id = action.payload;
            state.items = state.items.filter(i => i.cart_item_id !== cart_item_id);
        },
    },
    extraReducers: (builder) => {
        builder
            // ── refreshCart ──────────────────────────────────────
            .addCase(refreshCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(refreshCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(refreshCart.rejected, (state, action) => {
                state.loading = false;
                state.items = [];
                state.error = action.payload;
            })

            // ── updateQuantity (optimistic) ──────────────────────
            .addCase(updateQuantity.pending, (state, action) => {
                const { cart_item_id, quantity } = action.meta.arg;
                const item = state.items.find(i => i.cart_item_id === cart_item_id);
                if (item) {
                    item.quantity = quantity;
                }
            })
            .addCase(updateQuantity.rejected, (state, action) => {
                state.error = action.payload;
                // refreshCart is already dispatched in the thunk's catch block, 
                // which will roll back the state on failure.
            })

            // ── removeFromCart (optimistic) ──────────────────────
            .addCase(removeFromCart.pending, (state, action) => {
                const cart_item_id = action.meta.arg;
                state.items = state.items.filter(i => i.cart_item_id !== cart_item_id);
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                // Already handled by pending, but we keep fulfilled for consistency
                state.items = state.items.filter(i => i.cart_item_id !== action.payload);
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.error = action.payload;
            })

            // ── addToCart (optimistic for existing items) ────────
            .addCase(addToCart.pending, (state, action) => {
                const { product_id, quantity = 1 } = action.meta.arg;
                const item = state.items.find(i => i.product_id === product_id);
                if (item) {
                    item.quantity += quantity;
                }
                // Case for new items: wait for fulfilled to get the real cart_item_id
            })

            // ── clearCart ────────────────────────────────────────
            .addCase(clearCart.pending, (state) => {
                state.items = [];
            })

            // ── React to auth events ─────────────────────────────
            // When login succeeds → refresh cart
            .addCase(login.fulfilled, (state) => {
                state.loading = true; // show loading while refreshCart fires
            })
            // When logout happens → clear cart
            .addCase(logout, (state) => {
                state.items = [];
                state.loading = false;
                state.error = null;
            });
    },
});

export const { resetCart, updateQuantityOptimistic, removeFromCartOptimistic } = cartSlice.actions;

// ── Selectors ────────────────────────────────────────────────────
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartTotal = (state) =>
    state.cart.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
export const selectCartCount = (state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartItemByProductId = (state, productId) => 
    state.cart.items.find(item => item.product_id === productId);

export default cartSlice.reducer;
