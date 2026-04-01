import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store/hooks';
import { selectUser, selectIsAdmin, logout } from '../../store/slices/authSlice';
import { selectCartCount } from '../../store/slices/cartSlice';
import { ShoppingCart, Search, Menu, LayoutDashboard, LogIn, LogOut, ClipboardList, User, ChevronDown, MapPin } from 'lucide-react';

const Navbar = () => {
    const dispatch = useDispatch();
    const cartCount = useAppSelector(selectCartCount);
    const user = useAppSelector(selectUser);
    const isAdmin = useAppSelector(selectIsAdmin);
    const navigate = useNavigate();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        setDropdownOpen(false);
        dispatch(logout());
        navigate('/signin');
    };

    // Avatar initials from full name
    const initials = user?.full_name
        ? user.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-[95%] items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to="/store" className="text-2xl font-serif font-black tracking-tighter text-stone-900">
                    FURN
                </Link>

                <div className="hidden md:flex ml-20 space-x-15 text-sm font-semibold uppercase tracking-widest text-stone-500">
                    <Link to="/store" className="hover:text-stone-900 transition-colors">Home</Link>
                    <Link to="/store/products" className="hover:text-stone-900 transition-colors">Collection</Link>
                    <Link to="/store/about" className="hover:text-stone-900 transition-colors">About</Link>
                </div>

                <div className="flex items-center space-x-6">
                    {user && !isAdmin && (
                        <Link 
                            to="/store/orders" 
                            className="hidden lg:flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50/50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-all active:scale-95 shadow-sm"
                        >
                            <ClipboardList size={14} />
                            My Orders
                        </Link>
                    )}

                    <Link to="/store/cart" className="group relative text-stone-500 hover:text-stone-900 transition-transform active:scale-95">
                        <ShoppingCart size={22} />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white shadow-lg">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-2">
                            {/* Admin shortcut */}
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-all"
                                >
                                    <LayoutDashboard size={14} />
                                    <span className="hidden sm:inline">Admin</span>
                                </Link>
                            )}

                            {/* User avatar dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(o => !o)}
                                    className="flex items-center gap-2 rounded-full border border-stone-200 py-1.5 pl-1 pr-3 text-xs font-semibold text-stone-700 transition-all hover:border-stone-900 hover:text-stone-900"
                                >
                                    {/* Avatar circle */}
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-[11px] font-black text-white select-none">
                                        {initials}
                                    </span>
                                    <span className="hidden sm:inline max-w-[100px] truncate">{user.full_name?.split(' ')[0]}</span>
                                    <ChevronDown size={12} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-stone-100 bg-white shadow-xl overflow-hidden z-50">
                                        {/* User info header */}
                                        <div className="border-b border-stone-100 px-4 py-3">
                                            <p className="text-sm font-bold text-stone-900 truncate">{user.full_name}</p>
                                            <p className="text-xs text-stone-400 truncate">{user.email}</p>
                                        </div>

                                        <div className="py-1.5">
                                            <Link
                                                to="/store/profile"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
                                            >
                                                <User size={15} className="text-stone-400" />
                                                My Profile
                                            </Link>

                                            {!isAdmin && (
                                                <>
                                                    <Link
                                                        to="/store/orders"
                                                        onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
                                                    >
                                                        <ClipboardList size={15} className="text-stone-400" />
                                                        My Orders
                                                    </Link>
                                                    <Link
                                                        to="/store/profile"
                                                        onClick={() => { setDropdownOpen(false); }}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
                                                        state={{ tab: 'addresses' }}
                                                    >
                                                        <MapPin size={15} className="text-stone-400" />
                                                        My Addresses
                                                    </Link>
                                                </>
                                            )}
                                        </div>

                                        <div className="border-t border-stone-100 py-1.5">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                                            >
                                                <LogOut size={15} />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Link
                            to="/signin"
                            className="flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-700 transition-all active:scale-95"
                        >
                            <LogIn size={14} />
                            Sign In
                        </Link>
                    )}

                    <button className="md:hidden text-stone-500">
                        <Menu size={22} />
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;