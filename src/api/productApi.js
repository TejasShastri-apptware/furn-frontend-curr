import { apiFetch } from './api';

export const productApi = {
    /**
     * Get all products (Org-scoped)
     */
    getProducts: () => apiFetch('/products'),

    /**
     * Get all products globally (Admin/Internal)
     */
    getGlobalProducts: () => apiFetch('/products/global/all'),

    /**
     * Search products
     */
    searchProducts: (query) => apiFetch(`/products/search?q=${encodeURIComponent(query)}`),

    /**
     * Get a single product by ID
     */
    getProduct: (id) => apiFetch(`/products/${id}`),
    getProductById: (id) => apiFetch(`/products/${id}`),

    /**
     * Get tags for a specific product
     */
    getProductTags: (id) => apiFetch(`/products/${id}/tags`),

    /**
     * Get images for a specific product
     */
    getProductImages: (id) => apiFetch(`/products/${id}/images`),

    /**
     * Get products filtered by tags
     */
    getProductsByTags: (tags) => apiFetch(`/products/tags?tags=${tags.join(',')}`),

    /**
     * Create a product (Admin)
     */
    createProduct: (data) => apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    /**
     * Create a product with tags (Admin)
     */
    createProductWithTags: (data) => apiFetch('/products/with-tags', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    /**
     * Update a product (Admin)
     */
    updateProduct: (id, data) => apiFetch(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    /**
     * Update product stock (Admin)
     */
    updateStock: (id, quantity) => apiFetch(`/products/updateStock/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
    }),

    /**
     * Delete a product (Admin)
     */
    deleteProduct: (id) => apiFetch(`/products/${id}`, {
        method: 'DELETE',
    }),

    /**
     * Backward compatibility aliases
     */
    getCategories: () => apiFetch('/categories'),
    createCategory: (data) => apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateCategory: (id, data) => apiFetch(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteCategory: (id) => apiFetch(`/categories/${id}`, {
        method: 'DELETE',
    }),
    getOrgTags: () => apiFetch('/tags/org'),
    createTag: (data) => apiFetch('/tags', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateTag: (id, data) => apiFetch(`/tags/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteTag: (id) => apiFetch(`/tags/${id}`, {
        method: 'DELETE',
    }),

    /**
     * Add a tag to a product (Admin)
     */
    addTagToProduct: (productId, tagId) => apiFetch(`/products/${productId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tag_id: tagId }),
    }),

    /**
     * Remove a tag from a product (Admin)
     */
    removeTagFromProduct: (productId, tagId) => apiFetch(`/products/${productId}/tags/${tagId}`, {
        method: 'DELETE',
    }),

    /**
     * Product Image Management (Admin)
     */
    images: {
        upload: async (productId, file, isPrimary = false) => {
            const orgId = localStorage.getItem('org_id');
            const userId = localStorage.getItem('user_id');
            const formData = new FormData();
            formData.append('image', file);
            if (isPrimary !== undefined) formData.append('is_primary', String(isPrimary));

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload/product/${productId}?is_primary=${isPrimary}`, {
                method: 'POST',
                headers: {
                    ...(orgId ? { 'x-org-id': orgId } : {}),
                    ...(userId ? { 'x-user-id': userId } : {}),
                },
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: res.statusText }));
                throw new Error(err.message || 'Upload failed');
            }
            return res.json();
        },
        setPrimary: (productId, imageId) => apiFetch(`/products/${productId}/images/${imageId}/set-primary`, {
            method: 'PUT',
        }),
        delete: (productId, imageId) => apiFetch(`/products/${productId}/images/${imageId}`, {
            method: 'DELETE',
        }),
    },

    /**
     * Categories
     */
    categories: {
        getAll: () => apiFetch('/categories'),
        getById: (id) => apiFetch(`/categories/${id}`),
        create: (data) => apiFetch('/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id, data) => apiFetch(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id) => apiFetch(`/categories/${id}`, {
            method: 'DELETE',
        }),
    },

    /**
     * Tags
     */
    tags: {
        getOrgTags: () => apiFetch('/tags/org'),
        getAllTags: () => apiFetch('/tags/global'),
        create: (data) => apiFetch('/tags', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id, data) => apiFetch(`/tags/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id) => apiFetch(`/tags/${id}`, {
            method: 'DELETE',
        }),
    },
};
