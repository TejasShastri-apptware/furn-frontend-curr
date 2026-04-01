import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../../api/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};

//! NOTES NOTES:
// when a child component calls useAuth:
// useAuth() returns { user, orgId, orgName, orgLoading, orgError, login, logout, isAdmin }
// useAuth() -> useContext(AuthContext) -> AuthContext.Provider value

// IMPORTANT : after login succeeds and setUser(userData) happens, react rerenders the entire provider
// Because the value changed, every component using useAuth updates automatically


export const AuthProvider = ({ children }) => {
    const ORG_SLUG = 'Furn';

    const [orgId, setOrgId] = useState(() => localStorage.getItem('org_id'));
    const [orgName, setOrgName] = useState(() => localStorage.getItem('org_name') || '');
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('auth_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [orgLoading, setOrgLoading] = useState(!localStorage.getItem('org_id'));
    const [orgError, setOrgError] = useState(null);

    // Resolve org slug once on mount — always re-verify on fresh load
    useEffect(() => {
        // if (localStorage.getItem('org_id')) {
        //     setOrgLoading(false);
        //     return;
        // }
        // NOTE - hard-coded slug for now
        authApi.resolveOrg(ORG_SLUG)
            .then(data => {
                if (!data.org_id) throw new Error('Organization not found');
                console.log('[AuthContext] Resolved org_id:', data.org_id);
                localStorage.setItem('org_id', String(data.org_id));
                localStorage.setItem('org_name', data.org_name);
                setOrgId(String(data.org_id));
                setOrgName(data.org_name);
            })
            .catch(e => {
                console.error('[AuthContext] Org resolution error:', e);
                setOrgError(e.message);
            })
            .finally(() => setOrgLoading(false));
    }, []);

    // returned value - { success: bool, user?, error? }
    const login = async (email, password) => {
        if (!email || !password) return { success: false, error: 'Email and password are required' };

        // Guard: org must be resolved before we can scope the request
        const currentOrgId = localStorage.getItem('org_id');
        if (!currentOrgId) {
            return { success: false, error: 'Organization not resolved yet. Please wait a moment and try again.' };
        }

        try {
            const data = await authApi.login(email, password);

            const match = data.user;

            if (String(match.org_id) !== String(currentOrgId)) {
                console.error('[AuthContext] Tenancy mismatch — returned user org_id does not match resolved org_id');
                return { success: false, error: 'Account does not belong to this organization' };
            }

            const userData = {
                user_id: match.user_id,
                full_name: match.full_name,
                email: match.email,
                role_name: match.role_name,
                org_id: String(match.org_id),
            };

            localStorage.setItem('user_id', String(userData.user_id));
            localStorage.setItem('auth_user', JSON.stringify(userData));
            setUser(userData);

            // Signal other contexts (like CartContext) to refresh
            window.dispatchEvent(new Event('auth:login'));

            console.log('[AuthContext] Logged in:', userData.email, '| role:', userData.role_name, '| org_id:', userData.org_id);
            return { success: true, user: userData };
        } catch (e) {
            console.error('[AuthContext] Login error:', e);
            return { success: false, error: e.message || 'Login failed. Please try again.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('auth_user');
        setUser(null);
        // Signal other contexts (like CartContext) to reset
        window.dispatchEvent(new Event('auth:logout'));
    };

    const isAdmin = user?.role_name === 'admin' || user?.role_name === 'org_level_access' || user?.role_name === 'dev';

    return (
        <AuthContext.Provider value={{ user, orgId, orgName, orgLoading, orgError, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};
