import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import adminProductsReducer from './slices/adminProductsSlice';
import adminOrdersReducer from './slices/adminOrdersSlice';
import adminUsersReducer from './slices/adminUsersSlice';
import { resolveOrg } from './slices/authSlice';
import { refreshCart } from './slices/cartSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        adminProducts: adminProductsReducer,
        adminOrders: adminOrdersReducer,
        adminUsers: adminUsersReducer,
    },
});

// On startup: resolve org (always re-verify) and load cart if session exists
store.dispatch(resolveOrg());
store.dispatch(refreshCart());

export default store;
