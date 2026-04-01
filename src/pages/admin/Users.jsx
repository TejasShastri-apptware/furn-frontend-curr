import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchOrgUsers, createAdminUser, deleteAdminUser,
    selectAdminUsers, selectAdminUsersLoading, selectAdminUsersError,
    clearAdminUsersError,
} from '../../store/slices/adminUsersSlice';
import {
    fetchOrgOrders, localUpdateOrderStatus,
    selectAdminOrders, selectAdminOrdersLoading,
} from '../../store/slices/adminOrdersSlice';
import {
    Users, Search, UserPlus, Mail, Phone, Clock,
    ShoppingBag, MapPin, Trash2,
} from 'lucide-react';
import {
    Toast, ErrorBanner, ConfirmDialog, Drawer,
    PageHeader, StatCard, EmptyState, RoleBadge, OrderStatusBadge,
    inputCls, labelCls, SectionLabel, DetailRow, OrderDetailDrawer
} from '../../components/admin-components/adminComponents';

// ─── User Detail Drawer ──────────────────────────────────────
function UserDetailDrawer({ user, onClose, onDeleted }) {
    const dispatch = useAppDispatch();
    const allOrders = useAppSelector(selectAdminOrders);
    const ordersLoading = useAppSelector(selectAdminOrdersLoading);

    const [confirm, setConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Filter orders for this specific user from the Redux store
    const orders = allOrders.filter(o => String(o.user_id) === String(user.user_id));

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await dispatch(deleteAdminUser(user.user_id)).unwrap();
            onDeleted(user.user_id);
            onClose();
        } catch (e) {
            setToast({ msg: e || 'Could not delete user', type: 'error' });
            setDeleting(false);
            setConfirm(false);
        }
    };

    const handleStatusChange = useCallback((orderId, newStatus) => {
        dispatch(localUpdateOrderStatus({ orderId, status: newStatus }));
        setSelectedOrder(prev => prev ? { ...prev, order_status: newStatus } : prev);
    }, [dispatch]);

    const revenue = orders
        .filter(o => o.order_status === 'paid' || o.order_status === 'completed')
        .reduce((s, o) => s + Number(o.total_amount), 0);

    return (
        <>
            <Drawer
                title={user.full_name}
                subtitle={`User #${user.user_id}`}
                icon={Users}
                onClose={onClose}
                footer={
                    <div className="flex justify-end">
                        <button
                            onClick={() => setConfirm(true)}
                            className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <Trash2 size={14} /> Delete User
                        </button>
                    </div>
                }
            >
                <div className="space-y-6 pb-20">
                    {/* Role + meta */}
                    <div className="flex items-center gap-3">
                        <RoleBadge role={user.role_name} />
                        <span className="text-xs text-stone-600">Joined {new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>

                    {/* Contact info */}
                    <div className="space-y-2">
                        <SectionLabel icon={Mail} label="Contact" />
                        <div className="space-y-2">
                            <DetailRow icon={Mail} label="Email" value={user.email} />
                            <DetailRow icon={Phone} label="Phone" value={user.phone} />
                            <DetailRow icon={MapPin} label="Default Address" value={user.default_shipping_address} />
                        </div>
                    </div>

                    {/* Order stats */}
                    <div className="space-y-3">
                        <SectionLabel icon={ShoppingBag} label="Order Summary" />
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl bg-white/3 p-3 text-center">
                                <p className="text-2xl font-black text-white">{orders.length}</p>
                                <p className="text-[10px] uppercase tracking-wider text-stone-600 mt-0.5">Total Orders</p>
                            </div>
                            <div className="rounded-xl bg-white/3 p-3 text-center">
                                <p className="text-2xl font-black text-amber-400">₹{revenue.toLocaleString('en-IN')}</p>
                                <p className="text-[10px] uppercase tracking-wider text-stone-600 mt-0.5">Revenue</p>
                            </div>
                            <div className="rounded-xl bg-white/3 p-3 text-center">
                                <p className="text-2xl font-black text-white">{orders.filter(o => o.order_status === 'pending').length}</p>
                                <p className="text-[10px] uppercase tracking-wider text-stone-600 mt-0.5">Pending</p>
                            </div>
                        </div>
                    </div>

                    {/* Order history */}
                    <div className="space-y-3">
                        <SectionLabel icon={ShoppingBag} label="Order History" />
                        {ordersLoading && (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)}
                            </div>
                        )}
                        {!ordersLoading && orders.length === 0 && (
                            <p className="text-sm text-stone-600 py-4 text-center">No orders yet.</p>
                        )}
                        <div className="space-y-2">
                            {orders.map(o => (
                                <div key={o.order_id}
                                    onClick={() => setSelectedOrder(o)}
                                    className="flex items-center justify-between rounded-xl bg-white/3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors group">
                                    <div>
                                        <p className="text-sm font-semibold text-stone-200 font-mono group-hover:text-amber-400 transition-colors">Order #{o.order_id}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Clock size={10} className="text-stone-600" />
                                            <p className="text-[10px] text-stone-600">{new Date(o.created_at).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">₹{Number(o.total_amount).toLocaleString('en-IN')}</p>
                                        <div className="mt-0.5 flex justify-end">
                                            <OrderStatusBadge status={o.order_status} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Drawer>

            {selectedOrder && (
                <OrderDetailDrawer
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusChange={handleStatusChange}
                />
            )}

            {confirm && (
                <ConfirmDialog
                    message={`Permanently delete ${user.full_name}? This cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirm(false)}
                />
            )}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}

// ─── Add User Drawer ──────────────────────────────────────────
function AddUserDrawer({ onClose, onSuccess }) {
    const dispatch = useAppDispatch();
    const [form, setForm] = useState({ full_name: '', email: '', password_hash: '', phone: '', role_id: 2 });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await dispatch(createAdminUser(form)).unwrap();
            onSuccess('User created successfully!');
        } catch (e) {
            setError(e || 'Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Drawer
            title="Add New User"
            subtitle="Create a user account for this organization"
            icon={UserPlus}
            onClose={onClose}
            footer={
                <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-stone-400 hover:bg-white/5 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={submitting}
                        className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-50">
                        {submitting && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />}
                        {submitting ? 'Creating…' : 'Create User'}
                    </button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div><label className={labelCls}>Full Name *</label><input required className={inputCls} placeholder="Jane Doe" value={form.full_name} onChange={e => set('full_name', e.target.value)} /></div>
                <div><label className={labelCls}>Email *</label><input required type="email" className={inputCls} placeholder="jane@example.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
                <div><label className={labelCls}>Password *</label><input required type="password" className={inputCls} placeholder="••••••••" value={form.password_hash} onChange={e => set('password_hash', e.target.value)} /></div>
                <div><label className={labelCls}>Phone</label><input type="tel" className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
                <div>
                    <label className={labelCls}>Role</label>
                    <select className={`${inputCls} cursor-pointer`} value={form.role_id} onChange={e => set('role_id', Number(e.target.value))}>
                        <option value={2} className="bg-stone-900">Customer (default)</option>
                        <option value={3} className="bg-stone-900">Org Level Access</option>
                        <option value={1} className="bg-stone-900">Admin</option>
                    </select>
                </div>
                {error && <ErrorBanner error={error} />}
            </form>
        </Drawer>
    );
}

// ─── Main Page ────────────────────────────────────────────────
export default function UsersPage() {
    const dispatch = useAppDispatch();
    const users = useAppSelector(selectAdminUsers);
    const loading = useAppSelector(selectAdminUsersLoading);
    const error = useAppSelector(selectAdminUsersError);

    const [selectedUser, setSelectedUser] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        dispatch(clearAdminUsersError());
        dispatch(fetchOrgUsers());
        // Also load orders so UserDetailDrawer can show order history from the store
        dispatch(fetchOrgOrders());
    }, [dispatch]);

    const handleDeleted = (id) => {
        setToast({ msg: 'User deleted.', type: 'success' });
    };

    const handleAdded = (msg) => {
        setShowAdd(false);
        setToast({ msg, type: 'success' });
        // Re-fetch users to get the newly created user with full role data
        dispatch(fetchOrgUsers());
    };

    const filtered = users.filter(u =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.role_name || '').toLowerCase().includes(search.toLowerCase())
    );

    const admins = users.filter(u => u.role_name === 'Admin' || u.role_name === 'Org_Level_Access' || u.role_name === 'Dev').length;
    const customers = users.filter(u => u.role_name === 'Customer').length;

    return (
        <div className="min-h-full bg-stone-950 p-8 space-y-10">
            {/* Sticky Header Section */}
            <div className="sticky top-0 z-30 -mx-8 -mt-8 px-8 py-8 space-y-8 bg-stone-950/80 backdrop-blur-md border-b border-white/5">
                <PageHeader
                    icon={Users} iconColor="text-blue-400" iconBg="bg-blue-500/15"
                    title="Users"
                    subtitle={`${users.length} members in this organization`}
                    action={
                        <button onClick={() => setShowAdd(true)}
                            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/20">
                            <UserPlus size={16} /> Add User
                        </button>
                    }
                />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <StatCard icon={Users} label="Total Members" value={users.length} color="border-blue-500/20 text-blue-400" />
                    <StatCard icon={Users} label="Admins" value={admins} color="border-amber-500/20 text-amber-400" />
                    <StatCard icon={Users} label="Customers" value={customers} color="border-green-500/20 text-green-400" />
                </div>
            </div>

            <ErrorBanner error={error} />

            {/* Search */}
            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-600" />
                <input className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder-stone-600 outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition"
                    placeholder="Search name, email, role…"
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/8 bg-stone-900 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="border-b border-white/8">
                        <tr className="text-left text-[10px] uppercase tracking-widest text-stone-500">
                            <th className="px-5 py-4">User</th>
                            <th className="px-5 py-4">Email</th>
                            <th className="px-5 py-4">Phone</th>
                            <th className="px-5 py-4">Role</th>
                            <th className="px-5 py-4">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <tr key={i} className="border-b border-white/5 last:border-0">
                                    {[...Array(5)].map((_, j) => (
                                        <td key={j} className="px-5 py-4">
                                            <div className="h-4 rounded bg-white/5 animate-pulse" style={{ width: `${55 + j * 8}%` }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5}>
                                <EmptyState icon={Users} message={users.length === 0 ? 'No users yet.' : 'No users match your search.'} />
                            </td></tr>
                        ) : (
                            filtered.map(u => (
                                <tr key={u.user_id}
                                    onClick={() => setSelectedUser(u)}
                                    className="border-b border-white/5 last:border-0 hover:bg-white/4 cursor-pointer transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-sm font-bold text-amber-400">
                                                {u.full_name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-stone-200">{u.full_name}</p>
                                                <p className="text-[10px] font-mono text-stone-600">#{u.user_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-stone-400">{u.email}</td>
                                    <td className="px-5 py-4 text-stone-500">{u.phone || '—'}</td>
                                    <td className="px-5 py-4"><RoleBadge role={u.role_name} /></td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1 text-xs text-stone-500">
                                            <Clock size={11} />{new Date(u.created_at).toLocaleDateString('en-IN')}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedUser && (
                <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} onDeleted={handleDeleted} />
            )}
            {showAdd && <AddUserDrawer onClose={() => setShowAdd(false)} onSuccess={handleAdded} />}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
