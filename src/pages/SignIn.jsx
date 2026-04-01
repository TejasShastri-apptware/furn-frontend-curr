import { useState, Fragment } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../store/hooks';
import { login, selectOrgName, selectOrgLoading } from '../store/slices/authSlice';
import { refreshCart } from '../store/slices/cartSlice';
import { authApi } from '../api/authApi';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

import { Listbox, Transition } from '@headlessui/react';


const roles = [
    { id: 2, name: 'Admin' },
    { id: 3, name: 'Customer' },
];

export default function SignIn() {
    const dispatch = useDispatch();
    const orgName = useAppSelector(selectOrgName);
    const orgLoading = useAppSelector(selectOrgLoading);
    const navigate = useNavigate();
    const location = useLocation();

    // The location we were at before being redirected to sign-in
    const from = location.state?.from?.pathname;

    const [isRegister, setIsRegister] = useState(false);
    // ... (state variables remain same)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [role, setRole] = useState(roles[1]);

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                // Registration logic
                const regResult = await authApi.register({
                    full_name: fullName,
                    email: email.trim().toLowerCase(),
                    password_hash: password, // Plain text as per backend current state
                    phone,
                    role_id: role.id,
                    address_line1: addressLine1,
                    city,
                    state,
                    postal_code: postalCode,
                    country
                });

                if (regResult.user_id) {
                    // Auto-login after registration
                    const loginResult = await dispatch(login({ email, password })).unwrap();
                    await dispatch(refreshCart());
                    const isAdminRole = loginResult.role_name === 'admin' || loginResult.role_name === 'org_admin' || loginResult.role_name === 'dev';
                    const target = from || (isAdminRole ? '/admin' : '/store');
                    navigate(target, { replace: true });
                }
            } else {
                // Login logic
                const userData = await dispatch(login({ email, password })).unwrap();
                await dispatch(refreshCart());
                const isAdminRole = userData.role_name === 'admin' || userData.role_name === 'org_admin' || userData.role_name === 'dev';
                const target = from || (isAdminRole ? '/admin' : '/store');
                navigate(target, { replace: true });
            }
        } catch (e) {
            setError(e.message || e || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 flex items-center justify-center p-4 py-12">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-700/10 blur-3xl" />
            </div>

            <div className="relative w-full max-w-lg">
                {/* Card */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                    {/* Brand */}
                    <div className="mb-8 text-center">
                        <span className="inline-block text-4xl font-serif font-black tracking-tighter text-white mb-2">
                            FURN
                        </span>
                        <p className="text-stone-400 text-sm">
                            {orgLoading ? 'Loading…' : `${isRegister ? 'Create Account' : 'Sign In'} · ${orgName || 'Furn'}`}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-stone-600 outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-stone-600 outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className={isRegister ? "col-span-2" : "col-span-2"}>
                                <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-stone-600 outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-12 text-white placeholder-stone-600 outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {isRegister && (
                            <div className="space-y-4 pt-2 border-t border-white/5 mt-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/50">Shipping Address</p>
                                <div>
                                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">Address Line 1</label>
                                    <input
                                        type="text"
                                        value={addressLine1}
                                        onChange={e => setAddressLine1(e.target.value)}
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-stone-600 outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">City</label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={e => setCity(e.target.value)}
                                            required
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-stone-600 outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">State</label>
                                        <input
                                            type="text"
                                            value={state}
                                            onChange={e => setState(e.target.value)}
                                            required
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-stone-600 outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">Postal Code</label>
                                        <input
                                            type="text"
                                            value={postalCode}
                                            onChange={e => setPostalCode(e.target.value)}
                                            required
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-stone-600 outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">Country</label>
                                        <input
                                            type="text"
                                            value={country}
                                            onChange={e => setCountry(e.target.value)}
                                            required
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-stone-600 outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm"
                                        />
                                    </div>
                                    {/* <div>
                                        <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">Role</label>
                                        <select
                                            value={role}
                                            onChange={e => setRole(e.target.value)}
                                            required
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-black placeholder-stone-600 outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm"
                                        >
                                            <option value="1">Admin</option>
                                            <option value="2">Customer</option>
                                        </select>
                                    </div> */}

                                    <div>
  <label className="block text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">Role</label>
  <Listbox value={role} onChange={setRole}>
    <div className="relative">
      <Listbox.Button className="w-full text-left rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-sm cursor-pointer">
        {role.name}
      </Listbox.Button>

      <Transition
        as={Fragment}
        leave="transition duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Listbox.Options className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-stone-900 shadow-2xl backdrop-blur-xl">
          {roles.map((r) => (
            <Listbox.Option
              key={r.id}
              value={r}
              className={({ active }) =>
                `px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  active ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300'
                }`
              }
            >
              {r.name}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </div>
  </Listbox>
</div>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
                                <AlertCircle size={14} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || orgLoading}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-stone-950 transition-all hover:bg-amber-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <p className="text-xs text-stone-500">
                            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                                className="text-stone-300 hover:text-amber-500 transition-colors font-bold"
                            >
                                {isRegister ? 'Sign In' : 'Register Now'}
                            </button>
                        </p>
                        <p className="text-xs text-stone-600">
                            <Link to="/store" className="text-stone-400 hover:text-amber-500 transition-colors font-medium">
                                Go back to Storefront
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
