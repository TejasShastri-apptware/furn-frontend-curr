import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistApi } from '../../api/wishlistApi';
import { login, logout } from './authSlice';

// ── Thunks ──────────────────────────────────────────────────────
export const refreshWishlist = createAsyncThunk(
  'wishlist/refreshWishlist',
  async (_, { rejectWithValue }) => {
    const userId = localStorage.getItem('user_id');
    const orgId = localStorage.getItem('org_id');
    if (!userId || !orgId) return [];
    try {
      return await wishlistApi.getWishlist();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggleWishlist',
  async (product, { dispatch, getState, rejectWithValue }) => {
    const { wishlist } = getState();
    const existing = wishlist.items.find(i => i.product_id === product.product_id);
    
    try {
      if (existing) {
        await wishlistApi.removeFromWishlist(existing.wishlist_id);
      } else {
        await wishlistApi.addToWishlist(product.product_id);
      }
      dispatch(refreshWishlist());
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ── Initial State ────────────────────────────────────────────────
const initialState = {
  items: [],
  loading: false,
  error: null,
};

// ── Slice ────────────────────────────────────────────────────────
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    resetWishlist: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(refreshWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // React to auth events
      .addCase(login.fulfilled, (state) => {
        state.loading = true;
      })
      .addCase(logout, (state) => {
        state.items = [];
        state.loading = false;
        state.error = null;
      });
  },
});

export const { resetWishlist } = wishlistSlice.actions;

// ── Selectors ────────────────────────────────────────────────────
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectIsWishlisted = (state, productId) => 
  state.wishlist.items.some(i => i.product_id === productId);

export default wishlistSlice.reducer;
