import { apiFetch } from './api';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const authApi = {
    /**
     * Resolve organization slug to ID
     */
    resolveOrg: (slug) => fetch(`${BASE_URL}/orgs/resolve/${slug}`).then(r => {
        if (!r.ok) throw new Error(`Org resolve failed: ${r.status}`);
        return r.json();
    }),

    /**
     * User Login
     */
    login: (email, password) => apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    }),

    /**
     * User Registration
     */
    register: (userData) => apiFetch('/users/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),

    /**
     * Get current logged in user profile
     */
    getCurrentUser: () => apiFetch('/users/me'),

    /**
     * Update current user profile
     */
    updateCurrentUser: (userData) => apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify(userData),
    }),

    /**
     * Get all users in the organization (Admin)
     */
    getOrgUsers: () => apiFetch('/users/org'),

    /**
     * Get a single user within the organization (Admin)
     */
    getOrgUserById: (userId) => apiFetch(`/users/org/${userId}`),

    /**
     * Update a user within the organization (Admin)
     */
    updateOrgUser: (userId, userData) => apiFetch(`/users/org/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    }),

    /**
     * Delete a user from the organization (Admin)
     */
    deleteOrgUser: (userId) => apiFetch(`/users/org/${userId}`, {
        method: 'DELETE',
    }),

    /**
     * Get all users globally (Admin/Internal)
     */
    getGlobalUsers: () => apiFetch('/users/global'),

    /**
     * Get a single user globally (Admin/Internal)
     */
    getGlobalUserById: (userId) => apiFetch(`/users/global/${userId}`),

    /**
     * Organizations
     */
    createOrg: (data) => apiFetch('/orgs', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    getOrgs: () => apiFetch('/orgs'),
    getOrgById: (orgId) => apiFetch(`/orgs/${orgId}`),

    /**
     * Address Management
     */
    addresses: {
        getByUser: (userId) => apiFetch(`/addresses/user/${userId}`),
        create: (addressData) => apiFetch('/addresses', {
            method: 'POST',
            body: JSON.stringify(addressData),
        }),
        update: (addressId, addressData) => apiFetch(`/addresses/${addressId}`, {
            method: 'PUT',
            body: JSON.stringify(addressData),
        }),
        delete: (addressId) => apiFetch(`/addresses/${addressId}`, {
            method: 'DELETE',
        }),
        setDefault: (addressId) => apiFetch(`/addresses/set-default/${addressId}`, {
            method: 'PUT',
        }),
    }
};
