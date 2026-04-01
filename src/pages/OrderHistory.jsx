import { useState, useEffect } from 'react';
import { orderApi } from '../api/orderApi';
import { Link } from 'react-router-dom';
import {
    ShoppingBag, ChevronDown, ChevronUp, Package,
    MapPin, Calendar, AlertCircle, Loader2
} from 'lucide-react';

// Match schema ENUM exactly: pending | completed | cancelled
const STATUS_CFG = {
    pending:   { cls: 'bg-yellow-100 text-yellow-700 border-yellow-300',   dot: 'bg-yellow-500' },
    completed: { cls: 'bg-green-100  text-green-700  border-green-300',    dot: 'bg-green-500' },
    cancelled: { cls: 'bg-red-100    text-red-700    border-red-300',      dot: 'bg-red-500' },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] || { cls: 'bg-stone-100 text-stone-600 border-stone-300', dot: 'bg-stone-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize ${cfg.cls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {status}
        </span>
    );
}

// Group the flat rows returned by /orders/my-detailed-history into order objects
function groupOrders(rows) {
    const map = new Map();
    for (const row of rows) {
        if (!map.has(row.order_id)) {
            map.set(row.order_id, {
                order_id: row.order_id,
                user_id: row.user_id,
                total_amount: row.total_amount,
                order_status: row.order_status,
                created_at: row.created_at,
                address_line1: row.address_line1,
                city: row.city,
                postal_code: row.postal_code,
                country: row.country,
                items: [],
            });
        }
        if (row.product_id) {
            map.get(row.order_id).items.push({
                product_id: row.product_id,
                product_name: row.product_name,
                quantity: row.quantity,
                unit_price: row.unit_price,
                subtotal: row.subtotal,
            });
        }
    }
    // Sort newest first
    return Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// Single order card, expanding to show items
function OrderCard({ order }) {
    const [open, setOpen] = useState(false);
    const date = new Date(order.created_at);
    const hasAddress = order.address_line1;

    return (
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
            {/* Header row */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 text-left hover:bg-stone-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-500">
                        <ShoppingBag size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-stone-400 font-mono uppercase tracking-wide">Order</p>
                        <p className="text-lg font-black text-stone-900 font-mono">#{order.order_id}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">Total</p>
                        <p className="text-base font-black text-stone-900">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">Date</p>
                        <p className="text-sm font-semibold text-stone-600 flex items-center gap-1">
                            <Calendar size={12} />
                            {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    <StatusBadge status={order.order_status} />
                    <span className="text-stone-400">
                        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                </div>
            </button>

            {/* Expanded detail */}
            {open && (
                <div className="border-t border-stone-100 px-6 pb-6 pt-4 space-y-4">
                    {/* Address */}
                    {hasAddress && (
                        <div className="flex items-start gap-2 text-sm text-stone-600">
                            <MapPin size={14} className="mt-0.5 shrink-0 text-stone-400" />
                            <span>{order.address_line1}, {order.city}, {order.postal_code}, {order.country}</span>
                        </div>
                    )}

                    {/* Items */}
                    <div className="space-y-2">
                        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-stone-400">
                            <Package size={11} /> Items ({order.items.length})
                        </p>
                        {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-stone-800 truncate">{item.product_name}</p>
                                    <p className="text-xs text-stone-500">Qty {item.quantity} × ₹{Number(item.unit_price).toLocaleString('en-IN')}</p>
                                </div>
                                <p className="text-sm font-bold text-stone-900 ml-4 shrink-0">
                                    ₹{Number(item.subtotal).toLocaleString('en-IN')}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Total row */}
                    <div className="flex items-center justify-between rounded-xl bg-stone-900 px-5 py-3">
                        <span className="text-sm font-semibold text-stone-300">Order Total</span>
                        <span className="text-lg font-black text-white">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        orderApi.getMyOrderHistory()
            .then(data => setOrders(groupOrders(data.orders || data)))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const STATUS_FILTERS = ['all', 'pending', 'completed', 'cancelled'];
    const filtered = filter === 'all' ? orders : orders.filter(o => o.order_status === filter);

    return (
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-10">
                <h1 className="text-4xl font-serif font-black tracking-tighter text-stone-900">My Orders</h1>
                <p className="mt-2 text-stone-500">Track and review all your past orders.</p>
            </div>

            {/* Status filter tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
                {STATUS_FILTERS.map(s => {
                    const count = s === 'all' ? orders.length : orders.filter(o => o.order_status === s).length;
                    return (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-all ${filter === s
                                ? 'bg-stone-900 text-white'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                        >
                            {s}
                            {s !== 'all' && count > 0 && (
                                <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-stone-400" />
                </div>
            ) : error ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <ShoppingBag size={48} className="mb-4 text-stone-300" />
                    <h3 className="text-xl font-serif font-bold text-stone-900">
                        {orders.length === 0 ? 'No orders yet' : 'No orders match this filter'}
                    </h3>
                    {orders.length === 0 && (
                        <Link
                            to="/store/products"
                            className="mt-6 inline-flex items-center space-x-2 rounded-full bg-stone-900 px-8 py-3 text-sm font-bold text-white hover:bg-stone-800 active:scale-95 transition-all"
                        >
                            <span>Start Shopping</span>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-xs text-stone-400 mb-2">Showing {filtered.length} of {orders.length} orders</p>
                    {filtered.map(order => (
                        <OrderCard key={order.order_id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
