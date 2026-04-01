import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchAdminTags, fetchAdminProducts, createAdminTag,
    selectAdminTags, selectAdminProducts,
    selectAdminProductsLoading, selectAdminProductsError,
    clearAdminProductsError,
} from '../../store/slices/adminProductsSlice';
import { Tag, Plus, Search, Trash2, Package, ChevronDown } from 'lucide-react';
import {
    Toast, ErrorBanner, ConfirmDialog, Drawer,
    PageHeader, EmptyState, TagBadge, TAG_TYPE_COLORS,
    inputCls, labelCls, SectionLabel
} from '../../components/admin-components/adminComponents';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&q=50';
const TAG_TYPES = ['room', 'style', 'material', 'color', 'height', 'width', 'length', 'general'];

// ─── Tag Detail Drawer ────────────────────────────────────────
function TagDetailDrawer({ tag, onClose, onDeleted }) {
    const allProducts = useAppSelector(selectAdminProducts);
    const [confirm, setConfirm] = useState(false);
    const [toast, setToast] = useState(null);

    const taggedProducts = allProducts.filter(p =>
        (p.tags || '').split(',').map(t => t.trim()).includes(tag.tag_name)
    );

    const handleDelete = async () => {
        try {
            setToast({ msg: 'Tag deletion requires a backend endpoint not yet implemented. Remove manually via DB.', type: 'error' });
            setConfirm(false);
        } catch (e) {
            setToast({ msg: e.message, type: 'error' });
            setConfirm(false);
        }
    };

    return (
        <>
            <Drawer
                title={tag.tag_name}
                subtitle={`${tag.tag_type} tag · #${tag.tag_id}`}
                icon={Tag}
                iconColor="text-pink-400"
                iconBg="bg-pink-500/15"
                onClose={onClose}
                footer={
                    <button onClick={() => setConfirm(true)}
                        className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={14} /> Delete Tag
                    </button>
                }
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <TagBadge type={tag.tag_type} name={tag.tag_type} />
                        <span className="text-sm font-bold text-stone-300">{tag.tag_name}</span>
                    </div>

                    <div className="rounded-xl bg-white/3 px-4 py-3 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-stone-600 mb-1">Tag ID</p>
                            <p className="text-sm font-mono text-stone-300">#{tag.tag_id}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-stone-600 mb-1">Type</p>
                            <p className="text-sm font-semibold text-stone-300 capitalize">{tag.tag_type}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <SectionLabel icon={Package} label={`Tagged Products (${taggedProducts.length})`} />
                        {taggedProducts.length === 0 ? (
                            <p className="text-sm text-stone-600 text-center py-4">No products use this tag yet.</p>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                {taggedProducts.map(p => (
                                    <div key={p.product_id} className="flex items-center gap-3 rounded-xl bg-white/3 px-4 py-3">
                                        <img src={p.image_url || PLACEHOLDER} alt={p.name}
                                            className="h-10 w-10 rounded-lg object-cover shrink-0"
                                            onError={e => { e.currentTarget.src = PLACEHOLDER; }} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-stone-200 truncate">{p.name}</p>
                                            <p className="text-xs text-stone-500">₹{Number(p.price).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Drawer>

            {confirm && (
                <ConfirmDialog
                    message={`Delete tag "${tag.tag_name}"? This will not automatically remove it from products.`}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirm(false)}
                />
            )}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}

// ─── Add Tag Drawer ───────────────────────────────────────────
function AddTagDrawer({ onClose, onSuccess }) {
    const dispatch = useAppDispatch();
    const [form, setForm] = useState({ tag_name: '', tag_type: 'general' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSubmitting(true);
        try {
            await dispatch(createAdminTag(form)).unwrap();
            onSuccess('Tag created!');
        } catch (e) { setError(e || 'Failed to create tag'); }
        finally { setSubmitting(false); }
    };

    return (
        <Drawer
            title="New Tag" subtitle="Create a tag to label and filter products"
            icon={Plus} iconColor="text-pink-400" iconBg="bg-pink-500/15"
            onClose={onClose}
            footer={
                <div className="flex items-center justify-end gap-3">
                    <button onClick={onClose} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-stone-400 hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={submitting}
                        className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50 transition-all">
                        {submitting && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />}
                        {submitting ? 'Creating…' : 'Create Tag'}
                    </button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className={labelCls}>Tag Name *</label>
                    <input required className={inputCls} placeholder="e.g. Scandinavian" value={form.tag_name} onChange={e => setForm(p => ({ ...p, tag_name: e.target.value }))} />
                </div>
                <div>
                    <label className={labelCls}>Tag Type *</label>
                    <div className="relative">
                        <select className={`${inputCls} appearance-none pr-8 cursor-pointer capitalize`} value={form.tag_type} onChange={e => setForm(p => ({ ...p, tag_type: e.target.value }))}>
                            {TAG_TYPES.map(t => <option key={t} value={t} className="bg-stone-900 capitalize">{t}</option>)}
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
                    </div>
                    {/* Preview */}
                    {form.tag_name && (
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-stone-600">Preview:</span>
                            <TagBadge type={form.tag_type} name={form.tag_type} />
                            <span className="text-sm font-semibold text-stone-300">{form.tag_name}</span>
                        </div>
                    )}
                </div>
                <ErrorBanner error={error} />
            </form>
        </Drawer>
    );
}

// ─── Main Page ────────────────────────────────────────────────
export default function TagsPage() {
    const dispatch = useAppDispatch();
    const tags = useAppSelector(selectAdminTags);
    const loading = useAppSelector(selectAdminProductsLoading);
    const error = useAppSelector(selectAdminProductsError);

    const [typeFilter, setTypeFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        dispatch(clearAdminProductsError());
        dispatch(fetchAdminTags());
        // Load products so the detail drawer can show tagged products without extra fetch
        dispatch(fetchAdminProducts());
    }, [dispatch]);

    const types = ['all', ...TAG_TYPES];
    const filtered = tags
        .filter(t => typeFilter === 'all' || t.tag_type === typeFilter)
        .filter(t => search === '' || t.tag_name.toLowerCase().includes(search.toLowerCase()));

    const typeCount = (type) => tags.filter(t => t.tag_type === type).length;

    return (
        <div className="min-h-full bg-stone-950 p-8 space-y-7">
            <PageHeader
                icon={Tag} iconColor="text-pink-400" iconBg="bg-pink-500/15"
                title="Tags"
                subtitle={`${tags.length} tags in this organization`}
                action={
                    <button onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/20">
                        <Plus size={16} /> New Tag
                    </button>
                }
            />

            <ErrorBanner error={error} />

            {/* Filter + search row */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-1">
                    {types.map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all ${typeFilter === t
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'text-stone-500 hover:bg-white/5 hover:text-stone-300 border border-transparent'
                                }`}>
                            {t} {t !== 'all' && typeCount(t) > 0 && <span className="ml-1 opacity-60">({typeCount(t)})</span>}
                        </button>
                    ))}
                </div>
                <div className="relative ml-auto">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" />
                    <input className="w-44 rounded-xl border border-white/10 bg-white/5 pl-8 pr-4 py-2 text-sm text-white placeholder-stone-600 outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition"
                        placeholder="Search tags…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Tag grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {[...Array(15)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-stone-900 animate-pulse" />)}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState icon={Tag} message={tags.length === 0 ? 'No tags yet. Create one!' : 'No tags match your filter.'} />
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {filtered.map(tag => (
                        <div key={tag.tag_id}
                            onClick={() => setSelectedTag(tag)}
                            className="group cursor-pointer flex flex-col gap-2 rounded-2xl border border-white/8 bg-stone-900 p-4 hover:border-pink-500/30 hover:shadow-md hover:shadow-pink-500/5 transition-all duration-200">
                            <div className="flex items-start justify-between">
                                <div className={`rounded-lg p-1.5 ${TAG_TYPE_COLORS[tag.tag_type]?.includes('blue') ? 'bg-blue-500/10' : 'bg-white/5'}`}>
                                    <Tag size={13} className={TAG_TYPE_COLORS[tag.tag_type]?.split(' ')[0] || 'text-stone-400'} />
                                </div>
                                <span className="text-[9px] font-mono text-stone-700">#{tag.tag_id}</span>
                            </div>
                            <p className="text-sm font-semibold text-stone-200 leading-snug">{tag.tag_name}</p>
                            <TagBadge type={tag.tag_type} name={tag.tag_type} />
                        </div>
                    ))}
                </div>
            )}

            {selectedTag && (
                <TagDetailDrawer
                    tag={selectedTag}
                    onClose={() => setSelectedTag(null)}
                    onDeleted={(id) => { setSelectedTag(null); }}
                />
            )}
            {showAdd && (
                <AddTagDrawer
                    onClose={() => setShowAdd(false)}
                    onSuccess={(msg) => { setShowAdd(false); setToast({ msg, type: 'success' }); }}
                />
            )}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
