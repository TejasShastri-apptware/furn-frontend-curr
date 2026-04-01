import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../../api/cartApi';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [cartLoading, setCartLoading] = useState(false);

    // Cart item shape from backend:
    // { cart_item_id, product_id, name, price, image_url, quantity, item_total }

    const refreshCart = useCallback(async () => {
        const userId = localStorage.getItem('user_id');
        const orgId = localStorage.getItem('org_id');
        if (!userId || !orgId) {
            setCart([]);
            return;
        }
        try {
            setCartLoading(true);
            const items = await cartApi.getCart();
            setCart(items);
        } catch (e) {
            console.error('[CartContext] Failed to fetch cart:', e.message);
            setCart([]);
        } finally {
            setCartLoading(false);
        }
    }, []);

    // session isolation is important
    useEffect(() => {
        refreshCart();

        const onLogin = () => {
            console.log('[CartContext] Auth login detected, refreshing cart');
            refreshCart();
        };
        const onLogout = () => {
            console.log('[CartContext] Auth logout detected, clearing cart');
            setCart([]);
        };

        window.addEventListener('auth:login', onLogin);
        window.addEventListener('auth:logout', onLogout);
        return () => {
            window.removeEventListener('auth:login', onLogin);
            window.removeEventListener('auth:logout', onLogout);
        };
    }, [refreshCart]);

    /**
     * @param {number} product_id
     * @param {number} quantity  (defaults to 1)
     */
    const addToCart = async (product_id, quantity = 1) => {
        await cartApi.addToCart(product_id, quantity);
        await refreshCart();
    };

    const removeFromCart = async (cart_item_id) => {
        await cartApi.removeFromCart(cart_item_id);
        setCart(prev => prev.filter(i => i.cart_item_id !== cart_item_id));
    };

    const updateQuantity = async (cart_item_id, quantity) => {
        if (quantity < 1) return;
        
        setCart(prev =>
            prev.map(i =>
                i.cart_item_id === cart_item_id
                    ? { ...i, quantity, item_total: i.price * quantity }
                    : i
            )
        );
        try {
            await cartApi.updateQuantity(cart_item_id, quantity);
        } catch (e) {
            // Revert on failure
            console.error('[CartContext] Update quantity failed, reverting:', e.message);
            await refreshCart();
        }
    };

    const clearCart = async () => {
        setCart([]);
        setTimeout(refreshCart, 300);
    };

    const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                cartLoading,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                refreshCart,
                cartTotal,
                cartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};