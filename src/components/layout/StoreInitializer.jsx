import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resolveOrg, selectAuth } from '../../store/slices/authSlice';
import { refreshCart } from '../../store/slices/cartSlice';

export default function StoreInitializer({ children }) {
    const dispatch = useAppDispatch();
    const { orgId, user } = useAppSelector(selectAuth);

    useEffect(() => {
        if (!orgId) {
            dispatch(resolveOrg());
        }
    }, [dispatch, orgId]);

    useEffect(() => {
        if (user) {
            dispatch(refreshCart());
        }
    }, [dispatch, user]);

    // Handle auth:login and auth:logout events for potential legacy compatibility 
    // though Redux handles it better via thunks.
    useEffect(() => {
        const onLogin = () => dispatch(refreshCart());
        const onLogout = () => { /* Redux slice handles logout state */ };

        window.addEventListener('auth:login', onLogin);
        window.addEventListener('auth:logout', onLogout);
        return () => {
            window.removeEventListener('auth:login', onLogin);
            window.removeEventListener('auth:logout', onLogout);
        };
    }, [dispatch]);

    return children;
}
