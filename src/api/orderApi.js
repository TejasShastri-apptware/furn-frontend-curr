import { apiFetch } from './api';

export const orderApi = {
    /**
     * Place a new order
     */
    placeOrder: (orderData) => apiFetch('/orders/place', {
        method: 'POST',
        body: JSON.stringify(orderData),
    }),

    /**
     * Get order history summary for the current user
     */
    getMyOrderHistory: () => apiFetch('/orders/my-history'),

    /**
     * Get detailed order history (with items) for the current user
     */
    getMyDetailedOrderHistory: () => apiFetch('/orders/my-detailed-history'),

    /**
     * Get order details including items
     */
    getOrderDetails: (id) => apiFetch(`/orders/details/${id}`),

    /**
     * Get all orders in the organization (Admin)
     */
    getOrgOrders: () => apiFetch('/orders/org-all'),

    /**
     * Get all orders globally (Admin/Internal)
     */
    getGlobalOrders: () => apiFetch('/orders/global-all'),

    /**
     * Update order status (Admin)
     */
    updateStatus: (id, status) => apiFetch(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),
};
