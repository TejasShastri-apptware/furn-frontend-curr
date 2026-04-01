import { apiFetch } from './api';

export const wishlistApi = {
  getWishlist: () => apiFetch('/wishlist'),
  addToWishlist: (productId) => apiFetch('/wishlist/add', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId }),
  }),
  removeFromWishlist: (id) => apiFetch(`/wishlist/remove/${id}`, {
    method: 'DELETE',
  }),
};
