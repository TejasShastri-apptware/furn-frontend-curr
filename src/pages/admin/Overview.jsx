import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAdminProductsAll, selectAdminProducts, selectAdminCategories } from '../../store/slices/adminProductsSlice';
import {
    fetchOrgOrders, localUpdateOrderStatus,
    selectAdminOrders, selectAdminOrdersLoading,
} from '../../store/slices/adminOrdersSlice';
import { fetchOrgUsers, selectAdminUsers } from '../../store/slices/adminUsersSlice';
import { Users, Package, ShoppingBag, FolderOpen, TrendingUp, AlertCircle } from 'lucide-react';
import { OrderDetailDrawer, Toast } from '../../components/admin-components/adminComponents';

function StatCard({ icon: Icon, label, value, color, loading }) {
    return (
        <div className={`rounded-2xl border bg-white/5 p-6 ${color}`}>
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{label}</p>
                <div className="rounded-xl bg-white/5 p-2">
                    <Icon size={20} className="text-stone-400" />
                </div>
            </div>
            {loading ? (
                <div className="h-8 w-20 rounded-lg bg-white/5 animate-pulse" />
            ) : (
                <p className="text-3xl font-black tracking-tighter text-white">{value ?? '—'}</p>
            )}
        </div>
    );
}

function RecentOrdersTable({ orders, onOrderClick }) {
    const statusColors = {
        pending: 'text-yellow-400 bg-yellow-400/10',
        paid: 'text-green-400 bg-green-400/10',
        shipped: 'text-blue-400 bg-blue-400/10',
        cancelled: 'text-red-400 bg-red-400/10',
        refunded: 'text-stone-400 bg-stone-400/10',
        completed: 'text-slate-800 bg-[#09eb6f]'
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="border-b border-white/5 text-xs uppercase tracking-widest text-stone-500">
                        <th className="pb-3 pr-4">Order ID</th>
                        <th className="pb-3 pr-4">User ID</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">Total</th>
                        <th className="pb-3">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.slice(0, 5).map(o => (
                        <tr key={o.order_id}
                            onClick={() => onOrderClick(o)}
                            className="border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer transition-colors group">
                            <td className="py-3 pr-4 font-mono text-stone-300 group-hover:text-amber-400 transition-colors">#{o.order_id}</td>
                            <td className="py-3 pr-4 text-stone-400">{o.user_id}</td>
                            <td className="py-3 pr-4">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[o.order_status] || 'text-stone-400 bg-stone-400/10'}`}>
                                    {o.order_status}
                                </span>
                            </td>
                            <td className="py-3 pr-4 font-semibold text-white">₹{Number(o.total_amount).toLocaleString()}</td>
                            <td className="py-3 text-stone-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function Overview() {
    const dispatch = useAppDispatch();

    // Pull data from Redux slices
    const products = useAppSelector(selectAdminProducts);
    const categories = useAppSelector(selectAdminCategories);
    const orders = useAppSelector(selectAdminOrders);
    const users = useAppSelector(selectAdminUsers);
    const ordersLoading = useAppSelector(selectAdminOrdersLoading);

    // Track overall loading by checking if we have data yet
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        Promise.all([
            dispatch(fetchAdminProductsAll()),
            dispatch(fetchOrgOrders()),
            dispatch(fetchOrgUsers()),
        ])
            .catch(e => setError(e?.message || 'Failed to load overview data'))
            .finally(() => setInitialLoading(false));
    }, [dispatch]);

    const handleStatusChange = useCallback((orderId, newStatus) => {
        dispatch(localUpdateOrderStatus({ orderId, status: newStatus }));
        setSelectedOrder(prev => prev ? { ...prev, order_status: newStatus } : prev);
        setToast({
            msg: `Order #${orderId} marked as ${newStatus}.`,
            type: newStatus === 'completed' ? 'success' : 'error'
        });
    }, [dispatch]);

    const stats = {
        users: users.length,
        products: products.length,
        orders: orders.length,
        categories: categories.length,
    };

    const loading = initialLoading;

    const cards = [
        { icon: Users, label: 'Total Users', value: stats.users, color: 'border-blue-500/20' },
        { icon: Package, label: 'Products', value: stats.products, color: 'border-amber-500/20' },
        { icon: ShoppingBag, label: 'Orders', value: stats.orders, color: 'border-green-500/20' },
        { icon: FolderOpen, label: 'Categories', value: stats.categories, color: 'border-purple-500/20' },
    ];

    return (
        <div className="p-8 space-y-10">
            {/* Sticky Header Section */}
            <div className="sticky top-0 z-30 -mx-8 -mt-8 px-8 py-8 space-y-8 bg-stone-950/80 backdrop-blur-md border-b border-white/5">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-white">Overview</h1>
                    <p className="mt-1 text-sm text-stone-500">Welcome back — here's what's happening.</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map(c => <StatCard key={c.label} {...c} loading={loading} />)}
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Recent orders */}
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp size={18} className="text-amber-400" />
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-300">Recent Orders</h2>
                </div>
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : orders.length > 0 ? (
                    <RecentOrdersTable orders={orders} onOrderClick={setSelectedOrder} />
                ) : (
                    <p className="text-stone-500 text-sm">No orders yet.</p>
                )}
            </div>

            {selectedOrder && (
                <OrderDetailDrawer
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusChange={handleStatusChange}
                />
            )}

            {toast && (
                <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
}
