import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import adminProductsReducer from './slices/adminProductsSlice';
import adminOrdersReducer from './slices/adminOrdersSlice';
import adminUsersReducer from './slices/adminUsersSlice';
import wishlistReducer from './slices/wishlistSlice';
import { resolveOrg } from './slices/authSlice';
import { refreshCart } from './slices/cartSlice';
import { refreshWishlist } from './slices/wishlistSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        adminProducts: adminProductsReducer,
        adminOrders: adminOrdersReducer,
        adminUsers: adminUsersReducer,
        wishlist: wishlistReducer,
    },
});

// On startup: resolve org (always re-verify) and load cart if session exists
store.dispatch(resolveOrg());
store.dispatch(refreshCart());
store.dispatch(refreshWishlist());

export default store;
