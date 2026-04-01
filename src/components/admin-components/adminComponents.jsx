import { useEffect, useState } from 'react';
import {
    X, AlertCircle, CheckCircle, Trash2,
    ShoppingBag, Calendar, User, CreditCard,
    MapPin, Package, CheckCircle2, XCircle, Clock, Search
} from 'lucide-react';
import { orderApi } from '../../api/orderApi';

/* ─── Toast ─────────────────────────────────────────────────── */
export function Toast({ msg, type = 'success', onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-xl
            ${type === 'success' ? 'border-green-500/30 bg-green-500/10 text-green-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
            {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{msg}</span>
            <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity"><X size={14} /></button>
        </div>
    );
}

/* ─── Error Banner ───────────────────────────────────────────── */
export function ErrorBanner({ error }) {
    if (!error) return null;
    return (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
    );
}

/* ─── Confirm Delete Dialog ──────────────────────────────────── */
export function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-stone-900 p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-red-500/15 p-2.5">
                        <Trash2 size={18} className="text-red-400" />
                    </div>
                    <h3 className="text-base font-bold text-white">Confirm Delete</h3>
                </div>
                <p className="text-sm text-stone-400 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-stone-400 hover:bg-white/5 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-400 active:scale-95 transition-all">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Drawer Shell ───────────────────────────────────────────── */
export function Drawer({ title, subtitle, icon: Icon, iconColor = 'text-amber-400', iconBg = 'bg-amber-500/15', onClose, children, footer }) {
    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-white/8 bg-stone-950 shadow-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-2.5 ${iconBg}`}>
                            <Icon size={18} className={iconColor} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">{title}</h2>
                            {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-stone-500 hover:bg-white/5 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
                {footer && <div className="shrink-0 border-t border-white/8 px-6 py-4">{footer}</div>}
            </div>
        </div>
    );
}

/* ─── Page Header ────────────────────────────────────────────── */
export function PageHeader({ icon: Icon, iconColor, iconBg, title, subtitle, action }) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className={`rounded-2xl p-3 ${iconBg}`}>
                    <Icon size={22} className={iconColor} />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
                    <p className="text-sm text-stone-500">{subtitle}</p>
                </div>
            </div>
            {action}
        </div>
    );
}

/* ─── Stat Card ──────────────────────────────────────────────── */
export function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className={`rounded-2xl border bg-white/3 p-4 flex items-center gap-4 ${color}`}>
            <div className="rounded-xl bg-white/5 p-2.5 shrink-0"><Icon size={18} /></div>
            <div className="min-w-0">
                <p className="text-xs text-stone-500 font-medium truncate">{label}</p>
                <p className="text-2xl font-black text-white truncate">{value ?? '—'}</p>
            </div>
        </div>
    );
}

/* ─── Input helpers ──────────────────────────────────────────── */
export const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-stone-600 outline-none transition focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20";
export const labelCls = "block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1.5";

/* ─── Section Label ──────────────────────────────────────────── */
export function SectionLabel({ icon: Icon, label }) {
    return (
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500">
            {Icon && <Icon size={12} />} {label}
        </p>
    );
}

/* ─── Empty State ────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, message }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-stone-600">
            <Icon size={40} className="mb-3 opacity-40" />
            <p className="font-semibold text-sm">{message}</p>
        </div>
    );
}

/* ─── Role Badge ─────────────────────────────────────────────── */
const ROLE_COLORS = {
    Admin: 'text-red-400 bg-red-400/10 border-red-400/20',
    Org_Level_Access: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    Customer: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    Dev: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};
export function RoleBadge({ role }) {
    return (
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[role] || 'text-stone-400 bg-stone-400/10 border-stone-400/20'}`}>
            {role}
        </span>
    );
}

/* ─── Status Badge (Orders) ──────────────────────────────────── */
// Only the 3 values in the schema ENUM: pending | completed | cancelled
const STATUS_CFG = {
    pending: { cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25', dot: 'bg-yellow-400' },
    completed: { cls: 'bg-green-500/15  text-green-400  border-green-500/25', dot: 'bg-green-400' },
    cancelled: { cls: 'bg-red-500/15    text-red-400    border-red-500/25', dot: 'bg-red-400' },
};
export function OrderStatusBadge({ status }) {
    const cfg = STATUS_CFG[status] || { cls: 'bg-stone-500/15 text-stone-400 border-stone-500/25', dot: 'bg-stone-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${cfg.cls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {status}
        </span>
    );
}
export { STATUS_CFG };

/* ─── Tag Type Badge ─────────────────────────────────────────── */
export const TAG_TYPE_COLORS = {
    room: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    style: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    material: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    color: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    general: 'text-stone-400 bg-stone-400/10 border-stone-400/20',
    height: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
    width: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
    length: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
};
export function TagBadge({ type, name }) {
    return (
        <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase ${TAG_TYPE_COLORS[type] || TAG_TYPE_COLORS.general}`}>
            {name || type}
        </span>
    );
}

/* ─── Detail Row ────────────────────────────────────────────── */
export function DetailRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3 rounded-xl bg-white/3 px-4 py-3">
            <Icon size={14} className="mt-0.5 shrink-0 text-stone-500" />
            <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-stone-600 font-semibold">{label}</p>
                <p className="text-sm text-stone-200 break-words">{value || '—'}</p>
            </div>
        </div>
    );
}

/* ─── Order Card ─────────────────────────────────────────────── */
export function OrderCard({ o, onClick }) {
    const date = new Date(o.created_at);
    return (
        <div onClick={() => onClick(o)}
            className="group cursor-pointer flex flex-col rounded-2xl border border-white/8 bg-stone-900 p-5 hover:border-green-500/25 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300 gap-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] text-stone-600 font-mono uppercase tracking-wide">Order</p>
                    <p className="text-lg font-black text-white font-mono">#{o.order_id}</p>
                </div>
                <OrderStatusBadge status={o.order_status} />
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider mb-0.5">Total</p>
                    <p className="text-2xl font-black tracking-tight text-white">₹{Number(o.total_amount).toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-2xl bg-green-500/10 p-3"><ShoppingBag size={20} className="text-green-400" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-stone-500"><User size={11} /><span>User #{o.user_id}</span></div>
                <div className="flex items-center gap-1.5 text-stone-500"><Calendar size={11} /><span>{date.toLocaleDateString('en-IN')}</span></div>
                <div className="col-span-2 flex items-center gap-1.5 text-stone-600 truncate"><CreditCard size={11} /><span className="font-mono truncate">{o.payment_id || 'Not paid'}</span></div>
            </div>
            <div className="text-[10px] text-stone-600 group-hover:text-stone-400 transition-colors">Click to view &amp; manage →</div>
        </div>
    );
}

/* ─── Order Detail Drawer ────────────────────────────────────── */
export function OrderDetailDrawer({ order, onClose, onStatusChange }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');

    const [currentStatus, setCurrentStatus] = useState(order.order_status);

    useEffect(() => {
        orderApi.getOrderDetails(order.order_id)
            .then(setDetail)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [order.order_id]);

    const handleStatusUpdate = async (newStatus) => {
        setActionLoading(true);
        setActionError('');
        try {
            await orderApi.updateStatus(order.order_id, newStatus);
            setCurrentStatus(newStatus);
            if (onStatusChange) onStatusChange(order.order_id, newStatus);
        } catch (e) {
            setActionError(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const date = new Date(order.created_at);
    const o = detail?.order || order;
    const isPending = currentStatus === 'pending';

    const footer = isPending ? (
        <div className="space-y-2">
            {actionError && <ErrorBanner error={actionError} />}
            <div className="flex gap-3">
                <button
                    disabled={actionLoading}
                    onClick={() => handleStatusUpdate('completed')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-500 active:scale-95 transition-all disabled:opacity-50"
                >
                    <CheckCircle2 size={16} />
                    Approve Order
                </button>
                <button
                    disabled={actionLoading}
                    onClick={() => handleStatusUpdate('cancelled')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50"
                >
                    <XCircle size={16} />
                    Cancel Order
                </button>
            </div>
        </div>
    ) : (
        <div className="text-center text-xs text-stone-600 py-1">
            This order is <span className="font-semibold capitalize text-stone-400">{currentStatus}</span> and cannot be modified.
        </div>
    );

    return (
        <Drawer
            title={`Order #${order.order_id}`}
            subtitle={`Placed on ${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`}
            icon={ShoppingBag}
            iconColor="text-green-400"
            iconBg="bg-green-500/15"
            onClose={onClose}
            footer={footer}
        >
            <div className="space-y-6">
                <div className="rounded-2xl bg-white/3 p-5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-600 mb-1">Total Amount</p>
                        <p className="text-3xl font-black text-white">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right space-y-2">
                        <OrderStatusBadge status={currentStatus} />
                        <p className="text-[10px] text-stone-600 flex items-center gap-1 justify-end">
                            <Calendar size={10} />{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 rounded-xl bg-white/3 p-3">
                        <User size={13} className="mt-0.5 shrink-0 text-stone-500" />
                        <div><p className="text-[9px] uppercase tracking-wider text-stone-600">Customer</p><p className="text-xs font-semibold text-stone-300">User #{order.user_id}</p></div>
                    </div>
                    <div className="flex items-start gap-2 rounded-xl bg-white/3 p-3">
                        <CreditCard size={13} className="mt-0.5 shrink-0 text-stone-500" />
                        <div className="min-w-0"><p className="text-[9px] uppercase tracking-wider text-stone-600">Payment ID</p><p className="text-xs font-semibold text-stone-300 font-mono truncate">{order.payment_id || 'Not paid'}</p></div>
                    </div>
                    {o?.address_line1 && (
                        <div className="col-span-2 flex items-start gap-2 rounded-xl bg-white/3 p-3">
                            <MapPin size={13} className="mt-0.5 shrink-0 text-stone-500" />
                            <div><p className="text-[9px] uppercase tracking-wider text-stone-600">Shipping Address</p>
                                <p className="text-xs font-semibold text-stone-300">{o.address_line1}, {o.city}, {o.postal_code}, {o.country}</p></div>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <SectionLabel icon={Package} label={`Order Items ${detail?.items ? `(${detail.items.length})` : ''}`} />
                    {loading && <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>}
                    <ErrorBanner error={error} />
                    {!loading && detail?.items?.length === 0 && <p className="text-sm text-stone-600 text-center py-4">No items found.</p>}
                    <div className="space-y-2">
                        {(detail?.items || []).map((item, i) => (
                            <div key={i} className="flex items-center justify-between rounded-xl bg-white/3 px-4 py-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-stone-200 truncate">{item.name}</p>
                                    <p className="text-xs text-stone-500">Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString('en-IN')}</p>
                                </div>
                                <p className="text-sm font-bold text-white ml-4 shrink-0">
                                    ₹{(Number(item.unit_price) * item.quantity).toLocaleString('en-IN')}
                                </p>
                            </div>
                        ))}
                    </div>

                    {detail?.items && (
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center justify-between mt-4">
                            <p className="text-sm font-semibold text-amber-400">Order Total</p>
                            <p className="text-lg font-black text-amber-400">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                        </div>
                    )}
                </div>
            </div>
        </Drawer>
    );
}


// category filter for header in products page
export const ProductFilter = ({ categories, catFilter, setCatFilter, setSearch, search }) => {
    return (
        <div className='flex flex-wrap items-center gap-3 p-2 rounded-xl'>
            <div className='flex flex-wrap gap-1'>
                <button onClick={() => setCatFilter('all')}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${catFilter === 'all' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-stone-500 hover:bg-white/5 border border-transparent'}`}
                >
                    All
                </button>

                {categories.map(c => (
                    <button key={c.category_id} onClick={() => setCatFilter(String(c.category_id))}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${catFilter === String(c.category_id)
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'text-stone-500 hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        {c.category_name}
                    </button>
                ))}
            </div>

            <div className='relative ml-auto'>
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-600" />
                <input
                    type='text' placeholder='Search Products' value={search} onChange={(e) => setSearch(e.target.value)}
                    className='w-52 rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder-stone-600 outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition'
                />
            </div>

        </div>
    )
}