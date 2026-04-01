// const BASE_URL = 'http://localhost:5000/api';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Central fetch wrapper.
 * Automatically attaches x-org-id and x-user-id from localStorage
 * so every component in the app gets tenant-scoping for free.
 */
export async function apiFetch(path, options = {}) {
    const orgId = localStorage.getItem('org_id');
    const userId = localStorage.getItem('user_id');

    const headers = {
        'Content-Type': 'application/json',
        ...(orgId ? { 'x-org-id': orgId } : {}),
        ...(userId ? { 'x-user-id': userId } : {}),
        ...(options.headers || {}),
    };

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if(BASE_URL === 'http://localhost:5000/api'){
        console.log("Backend is running on localhost:5000");
    }
    else{
        console.log("Backend is running on railway");
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || 'API Error');
    }

    return res.json();
}
