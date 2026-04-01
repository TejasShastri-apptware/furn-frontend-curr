import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchAdminCategories, fetchAdminProducts,
    createAdminCategory, updateAdminCategory, deleteAdminCategory,
    selectAdminCategories, selectAdminProducts,
    selectAdminProductsLoading, selectAdminProductsError,
    clearAdminProductsError,
} from '../../store/slices/adminProductsSlice';
import {
    FolderOpen, Plus, Search, Pencil, Trash2, Package,
    ChevronRight
} from 'lucide-react';
import {
    Toast, ErrorBanner, ConfirmDialog, Drawer,
    PageHeader, EmptyState,
    inputCls, labelCls, SectionLabel
} from '../../components/admin-components/adminComponents';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&q=50';

// ─── Category Detail Drawer ───────────────────────────────────
function CategoryDetailDrawer({ cat, onClose, onDeleted, onUpdated }) {
    const dispatch = useAppDispatch();
    const allProducts = useAppSelector(selectAdminProducts);

    const products = allProducts.filter(
        p => p.category_id === cat.category_id || p.category_name === cat.category_name
    );

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ category_name: cat.category_name, description: cat.description || '' });
    const [saving, setSaving] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);

    const handleSave = async () => {
        if (!form.category_name.trim()) { setError('Category name is required'); return; }
        setSaving(true); setError('');
        try {
            await dispatch(updateAdminCategory({ id: cat.category_id, data: form })).unwrap();
            onUpdated({ ...cat, ...form });
            setEditing(false);
            setToast({ msg: 'Category updated.', type: 'success' });
        } catch (e) {
            setError(e || 'Update failed');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await dispatch(deleteAdminCategory(cat.category_id)).unwrap();
            onDeleted(cat.category_id);
            onClose();
        } catch (e) {
            setToast({ msg: e || 'Delete failed', type: 'error' });
            setConfirm(false);
        }
    };

    return (
        <>
            <Drawer
                title={editing ? 'Edit Category' : cat.category_name}
                subtitle={`${products.length} products · Category #${cat.category_id}`}
                icon={FolderOpen}
                iconColor="text-purple-400"
                iconBg="bg-purple-500/15"
                onClose={onClose}
                footer={
                    <div className="flex items-center justify-between">
                        <button onClick={() => setConfirm(true)}
                            className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 size={14} /> Delete
                        </button>
                        <div className="flex gap-3">
                            {editing ? (
                                <>
                                    <button onClick={() => { setEditing(false); setError(''); }} className="rounded-xl border border-white/10 px-5 py-2 text-sm font-semibold text-stone-400 hover:bg-white/5 transition-colors">Cancel</button>
                                    <button onClick={handleSave} disabled={saving}
                                        className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50 transition-all">
                                        {saving ? 'Saving…' : 'Save Changes'}
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2 text-sm font-semibold text-stone-300 hover:bg-white/10 transition-colors">
                                    <Pencil size={14} /> Edit
                                </button>
                            )}
                        </div>
                    </div>
                }
            >
                <div className="space-y-6">
                    {editing ? (
                        <div className="space-y-4">
                            <div><label className={labelCls}>Category Name *</label><input className={inputCls} value={form.category_name} onChange={e => setForm(p => ({ ...p, category_name: e.target.value }))} /></div>
                            <div><label className={labelCls}>Description</label><textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                            <ErrorBanner error={error} />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="rounded-xl bg-white/3 px-4 py-3">
                                <p className="text-[10px] uppercase tracking-wider text-stone-600 font-semibold mb-1">Description</p>
                                <p className="text-sm text-stone-300">{cat.description || <span className="text-stone-600 italic">No description</span>}</p>
                            </div>
                        </div>
                    )}

                    {/* Products under this category */}
                    <div className="space-y-3">
                        <SectionLabel icon={Package} label={`Products (${products.length})`} />
                        {products.length === 0 ? (
                            <p className="text-sm text-stone-600 text-center py-4">No products in this category.</p>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                {products.map(p => (
                                    <div key={p.product_id} className="flex items-center gap-3 rounded-xl bg-white/3 px-4 py-3">
                                        <img src={p.image_url || PLACEHOLDER} alt={p.name}
                                            className="h-10 w-10 rounded-lg object-cover shrink-0"
                                            onError={e => { e.currentTarget.src = PLACEHOLDER; }} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-stone-200 truncate">{p.name}</p>
                                            <p className="text-xs text-stone-500">₹{Number(p.price).toLocaleString('en-IN')} · Stock: {p.stock_quantity}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-stone-600 shrink-0" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Drawer>

            {confirm && (
                <ConfirmDialog
                    message={`Delete category "${cat.category_name}"? Products in this category cannot be deleted with it. Move products first.`}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirm(false)}
                />
            )}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}

// ─── Add Category Drawer ──────────────────────────────────────
function AddCategoryDrawer({ onClose, onSuccess }) {
    const dispatch = useAppDispatch();
    const [form, setForm] = useState({ category_name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSubmitting(true);
        try {
            await dispatch(createAdminCategory(form)).unwrap();
            onSuccess('Category created!');
        } catch (e) { setError(e || 'Failed to create category'); }
        finally { setSubmitting(false); }
    };

    return (
        <Drawer
            title="New Category" subtitle="Add a product category for this organization"
            icon={Plus} iconColor="text-purple-400" iconBg="bg-purple-500/15"
            onClose={onClose}
            footer={
                <div className="flex items-center justify-end gap-3">
                    <button onClick={onClose} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-stone-400 hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={submitting}
                        className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50 transition-all">
                        {submitting && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />}
                        {submitting ? 'Creating…' : 'Create Category'}
                    </button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div><label className={labelCls}>Category Name *</label><input required className={inputCls} placeholder="e.g. Sofas & Lounges" value={form.category_name} onChange={e => setForm(p => ({ ...p, category_name: e.target.value }))} /></div>
                <div><label className={labelCls}>Description</label><textarea className={`${inputCls} resize-none`} rows={4} placeholder="What kinds of products belong here?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                <ErrorBanner error={error} />
            </form>
        </Drawer>
    );
}

// ─── Main Page ────────────────────────────────────────────────
export default function CategoriesPage() {
    const dispatch = useAppDispatch();
    const cats = useAppSelector(selectAdminCategories);
    const loading = useAppSelector(selectAdminProductsLoading);
    const error = useAppSelector(selectAdminProductsError);

    const [selectedCat, setSelectedCat] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        dispatch(clearAdminProductsError());
        dispatch(fetchAdminCategories());
        // Also load products so the detail drawer can show them without an extra fetch
        dispatch(fetchAdminProducts());
    }, [dispatch]);

    const handleDeleted = (id) => setSelectedCat(null);
    const handleUpdated = (updated) => setSelectedCat(updated);

    const filtered = cats.filter(c =>
        c.category_name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-full bg-stone-950 p-8 space-y-7">
            <div className='space-y-8 sticky top-0 z-20 bg-stone-950/80 pb-6 backdrop-blur-md'>
                <PageHeader
                    icon={FolderOpen} iconColor="text-purple-400" iconBg="bg-purple-500/15"
                    title="Categories"
                    subtitle={`${cats.length} categories defined`}
                    action={
                        <button onClick={() => setShowAdd(true)}
                            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/20">
                            <Plus size={16} /> New Category
                        </button>
                    }
                />

                <ErrorBanner error={error} />

                <div className="relative max-w-sm">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-600" />
                    <input className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder-stone-600 outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition"
                        placeholder="Search categories…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Card grid */}
            {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-stone-900 animate-pulse border border-white/5" />)}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState icon={FolderOpen} message={cats.length === 0 ? 'No categories yet. Add one!' : 'No categories match your search.'} />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map(c => (
                        <div key={c.category_id}
                            onClick={() => setSelectedCat(c)}
                            className="group relative cursor-pointer rounded-2xl border border-white/8 bg-stone-900 p-5 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
                            <div className="flex items-start justify-between mb-3">
                                <div className="rounded-xl bg-purple-500/15 p-2.5">
                                    <FolderOpen size={18} className="text-purple-400" />
                                </div>
                                <span className="text-[10px] font-mono text-stone-600">#{c.category_id}</span>
                            </div>
                            <h3 className="font-bold text-stone-100 mb-1">{c.category_name}</h3>
                            <p className="text-xs text-stone-500 line-clamp-2 mb-3">{c.description || 'No description provided.'}</p>
                            <div className="flex items-center gap-1 text-[10px] text-stone-600">
                                <ChevronRight size={10} />
                                <span>Click to view products & edit</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedCat && (
                <CategoryDetailDrawer
                    cat={selectedCat}
                    onClose={() => setSelectedCat(null)}
                    onDeleted={(id) => { handleDeleted(id); setSelectedCat(null); }}
                    onUpdated={(updated) => { handleUpdated(updated); setSelectedCat(updated); }}
                />
            )}
            {showAdd && (
                <AddCategoryDrawer
                    onClose={() => setShowAdd(false)}
                    onSuccess={(msg) => { setShowAdd(false); setToast({ msg, type: 'success' }); }}
                />
            )}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
