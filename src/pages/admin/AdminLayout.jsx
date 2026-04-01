import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store/hooks';
import { selectUser, selectIsAdmin, selectOrgName, logout } from '../../store/slices/authSlice';
import {
    LayoutDashboard, Users, Package, ShoppingBag,
    Tag, FolderOpen, LogOut, Store
} from 'lucide-react';

const navItems = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { to: '/admin/tags', label: 'Tags', icon: Tag },
];

export default function AdminLayout() {
    const dispatch = useDispatch();
    const user = useAppSelector(selectUser);
    const isAdmin = useAppSelector(selectIsAdmin);
    const orgName = useAppSelector(selectOrgName);
    const navigate = useNavigate();

    if (!user) return <Navigate to="/signin" replace />;
    if (!isAdmin) return <Navigate to="/store" replace />;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/signin');
    };

    return (
        <div className="flex min-h-screen max-h-screen bg-stone-950 text-white font-sans sticky left-0">
            {/* Sidebar */}
            <aside className="flex w-64 shrink-0 flex-col border-r border-white/5 bg-stone-900">
                {/* Logo */}
                <div className="flex h-20 items-center border-b border-white/5 px-6">
                    <span className="text-2xl font-serif font-black tracking-tighter text-white">FURN</span>
                    <span className="ml-2 rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                        Admin
                    </span>
                </div>

                {/* Org badge */}
                <div className="mx-4 mt-4 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-widest text-stone-500">Organization</p>
                    <p className="mt-0.5 text-sm font-semibold text-stone-200 truncate">{orgName || 'Furn'}</p>
                </div>

                {/* Nav */}
                <nav className="mt-4 flex-1 space-y-0.5 px-3">
                    {navItems.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive
                                    ? 'bg-amber-500/15 text-amber-400'
                                    : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom: user + logout */}
                <div className="border-t border-white/5 p-4 space-y-2">
                    <div className="rounded-xl bg-white/5 px-3 py-2">
                        <p className="text-xs font-semibold text-stone-200 truncate">{user.full_name}</p>
                        <p className="text-[10px] text-stone-500 truncate">{user.role_name}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-500 transition-all hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                    <NavLink
                        to="/store"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-500 transition-all hover:bg-white/5 hover:text-stone-300"
                    >
                        <Store size={16} />
                        Back to Store
                    </NavLink>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
