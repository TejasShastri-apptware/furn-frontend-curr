import { apiFetch } from './api';

export const cartApi = {
    /**
     * Get the user's cart items
     */
    getCart: () => apiFetch('/cart/'),

    /**
     * Add an item to the cart
     */
    addToCart: (productId, quantity = 1) => apiFetch('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity }),
    }),

    /**
     * Remove an item from the cart
     */
    removeFromCart: (cartItemId) => apiFetch(`/cart/remove/${cartItemId}`, {
        method: 'DELETE',
    }),

    /**
     * Update the quantity of an item in the cart
     */
    updateQuantity: (cartItemId, quantity) => apiFetch(`/cart/update/${cartItemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
    }),
};
