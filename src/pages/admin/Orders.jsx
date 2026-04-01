import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchOrgOrders, localUpdateOrderStatus,
    selectAdminOrders, selectAdminOrdersLoading, selectAdminOrdersError,
    clearAdminOrdersError,
} from '../../store/slices/adminOrdersSlice';
import {
    ShoppingBag, Search, Hash, TrendingUp, Clock,
} from 'lucide-react';
import {
    ErrorBanner, PageHeader, StatCard, EmptyState,
    OrderStatusBadge, Toast, OrderDetailDrawer, OrderCard
} from '../../components/admin-components/adminComponents';

// Only values from the schema ENUM
const STATUS_LIST = ['all', 'pending', 'completed', 'cancelled'];

// ─── Main Page ────────────────────────────────────────────────
export default function OrdersPage() {
    const dispatch = useAppDispatch();
    const orders = useAppSelector(selectAdminOrders);
    const loading = useAppSelector(selectAdminOrdersLoading);
    const error = useAppSelector(selectAdminOrdersError);

    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        dispatch(clearAdminOrdersError());
        dispatch(fetchOrgOrders());
    }, [dispatch]);

    // Called by the drawer after a successful status change
    const handleStatusChange = useCallback((orderId, newStatus) => {
        // Optimistic update in the Redux store
        dispatch(localUpdateOrderStatus({ orderId, status: newStatus }));
        // Also patch the selectedOrder so the drawer header stays consistent
        setSelectedOrder(prev => prev ? { ...prev, order_status: newStatus } : prev);
        const label = newStatus === 'completed' ? 'approved' : 'cancelled';
        setToast({ msg: `Order #${orderId} ${label} successfully.`, type: newStatus === 'completed' ? 'success' : 'error' });
    }, [dispatch]);

    // Revenue from completed orders only
    const totalRevenue = orders
        .filter(o => o.order_status === 'completed')
        .reduce((s, o) => s + Number(o.total_amount), 0);
    const pendingCount = orders.filter(o => o.order_status === 'pending').length;

    const filtered = orders
        .filter(o => filter === 'all' || o.order_status === filter)
        .filter(o => search === '' ||
            String(o.order_id).includes(search) ||
            String(o.user_id).includes(search) ||
            (o.payment_id || '').toLowerCase().includes(search.toLowerCase())
        );

    return (
        <div className="min-h-full bg-stone-950 p-8 space-y-10">
            {/* Sticky Header Section */}
            <div className="sticky top-0 z-30 -mx-8 -mt-8 px-8 py-8 space-y-8 bg-stone-950/80 backdrop-blur-md border-b border-white/5">
                <PageHeader
                    icon={ShoppingBag} iconColor="text-green-400" iconBg="bg-green-500/15"
                    title="Orders"
                    subtitle={`${orders.length} total orders across this organization`}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard icon={Hash} label="Total Orders" value={orders.length} color="border-amber-500/20 text-amber-400" />
                    <StatCard icon={TrendingUp} label="Revenue (Completed)" value={`₹${totalRevenue.toLocaleString('en-IN')}`} color="border-green-500/20 text-green-400" />
                    <StatCard icon={Clock} label="Pending Approval" value={pendingCount} color="border-yellow-500/20 text-yellow-400" />
                </div>
            </div>

            <ErrorBanner error={error} />

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-1">
                    {STATUS_LIST.map(s => {
                        const count = orders.filter(o => o.order_status === s).length;
                        return (
                            <button key={s} onClick={() => setFilter(s)}
                                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${filter === s
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'text-stone-500 hover:bg-white/5 hover:text-stone-300 border border-transparent'
                                    }`}>
                                {s}
                                {s !== 'all' && count > 0 && (
                                    <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold">{count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <div className="relative ml-auto">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" />
                    <input className="w-56 rounded-xl border border-white/10 bg-white/5 pl-8 pr-4 py-2 text-sm text-white placeholder-stone-600 outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition"
                        placeholder="Order ID, user, payment…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-2xl bg-stone-900 p-5 space-y-4 animate-pulse border border-white/5">
                            <div className="flex justify-between"><div className="h-7 w-24 rounded-lg bg-white/5" /><div className="h-6 w-20 rounded-full bg-white/5" /></div>
                            <div className="h-px bg-white/5" />
                            <div className="h-8 w-32 rounded-lg bg-white/5" />
                            <div className="grid grid-cols-2 gap-2"><div className="h-5 rounded bg-white/5" /><div className="h-5 rounded bg-white/5" /></div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState icon={ShoppingBag} message={orders.length === 0 ? 'No orders yet.' : 'No orders match this filter.'} />
            ) : (
                <>
                    <p className="text-xs text-stone-600 mb-2">Showing {filtered.length} of {orders.length} orders</p>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map(o => <OrderCard key={o.order_id} o={o} onClick={setSelectedOrder} />)}
                    </div>
                </>
            )}

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
