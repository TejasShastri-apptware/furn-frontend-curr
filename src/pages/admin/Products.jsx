import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchAdminProductsAll, fetchAdminProducts,
    createAdminProduct, updateAdminProduct, deleteAdminProduct,
    selectAdminProducts, selectAdminCategories, selectAdminTags,
    selectAdminProductsLoading, selectAdminProductsError,
    clearAdminProductsError,
} from '../../store/slices/adminProductsSlice';
import { productApi } from '../../api/productApi';
import {
    Package, Plus, Search, AlertCircle, CheckCircle, XCircle,
    ChevronDown, Tag, DollarSign, Box, Palette, Ruler, Pencil, Trash2,
    BarChart3, Images, Upload, X, Star
} from 'lucide-react';
import {
    Toast, ErrorBanner, ConfirmDialog, Drawer, PageHeader, StatCard,
    EmptyState, inputCls, labelCls, SectionLabel,
    ProductFilter
} from '../../components/admin-components/adminComponents';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=60';

const STOCK_STATUS = (qty) => {
    if (qty === 0) return { label: 'Out of Stock', cls: 'bg-red-500/15 text-red-400 border-red-500/20' };
    if (qty < 10) return { label: `Low · ${qty}`, cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' };
    return { label: `In Stock · ${qty}`, cls: 'bg-green-500/15 text-green-400 border-green-500/20' };
};

// ─── Shared Form ──────────────────────────────────────────────
function ProductForm({ form, setForm, categories, tags }) {
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const toggleTag = (id) => setForm(p => ({
        ...p,
        tag_ids: (p.tag_ids || []).includes(id)
            ? p.tag_ids.filter(t => t !== id)
            : [...(p.tag_ids || []), id]
    }));

    return (
        <div className="space-y-5">
            <div className="space-y-4">
                <SectionLabel icon={Package} label="Basic Info" />
                <div><label className={labelCls}>Product Name *</label><input required className={inputCls} placeholder="e.g. Velvet Accent Chair" value={form.name || ''} onChange={e => set('name', e.target.value)} /></div>

                <div>
                    <label className={labelCls}>Category *</label>
                    <div className="relative">
                        <select required className={`${inputCls} appearance-none pr-8 cursor-pointer`} value={form.category_id || ''} onChange={e => set('category_id', e.target.value)}>
                            <option value="" className="bg-stone-900 text-stone-500">Select a category…</option>
                            {categories.map(c => <option key={c.category_id} value={c.category_id} className="bg-stone-900">{c.category_name}</option>)}
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
                    </div>
                    {categories.length === 0 && <p className="mt-1 text-[10px] text-red-400">No categories found. Create a category first.</p>}
                </div>

                <div><label className={labelCls}>Description</label><textarea className={`${inputCls} resize-none`} rows={3} placeholder="Describe the product…" value={form.description || ''} onChange={e => set('description', e.target.value)} /></div>
            </div>

            <div className="space-y-4">
                <SectionLabel icon={DollarSign} label="Pricing" />
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Price (₹) *</label><input type="number" min="0" step="0.01" required className={inputCls} placeholder="0.00" value={form.price || ''} onChange={e => set('price', e.target.value)} /></div>
                    <div><label className={labelCls}>Discount Price (₹)</label><input type="number" min="0" step="0.01" className={inputCls} placeholder="Optional" value={form.discount_price || ''} onChange={e => set('discount_price', e.target.value)} /></div>
                </div>
            </div>

            <div className="space-y-4">
                <SectionLabel icon={Palette} label="Attributes" />
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Material</label><input className={inputCls} placeholder="e.g. Solid Wood" value={form.material || ''} onChange={e => set('material', e.target.value)} /></div>
                    <div><label className={labelCls}>Color</label><input className={inputCls} placeholder="e.g. Walnut Brown" value={form.color || ''} onChange={e => set('color', e.target.value)} /></div>
                </div>
            </div>

            <div className="space-y-4">
                <SectionLabel icon={Ruler} label="Dimensions (cm)" />
                <div className="grid grid-cols-3 gap-4">
                    {['length', 'width', 'height'].map(d => (
                        <div key={d}><label className={labelCls}>{d}</label><input type="number" min="0" step="0.1" className={inputCls} placeholder="—" value={form[d] || ''} onChange={e => set(d, e.target.value)} /></div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <SectionLabel icon={Box} label="Inventory" />
                <div className="w-1/2"><label className={labelCls}>Stock Quantity *</label><input type="number" min="0" required className={inputCls} placeholder="0" value={form.stock_quantity || ''} onChange={e => set('stock_quantity', e.target.value)} /></div>
            </div>

            {tags.length > 0 && (
                <div className="space-y-3">
                    <SectionLabel icon={Tag} label="Tags" />
                    <div className="flex flex-wrap gap-2">
                        {tags.map(t => {
                            const sel = (form.tag_ids || []).includes(t.tag_id);
                            return (
                                <button key={t.tag_id} type="button" onClick={() => toggleTag(t.tag_id)}
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${sel
                                        ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                                        : 'border-white/10 bg-white/5 text-stone-400 hover:border-white/20'}`}>
                                    {sel && '✓ '}{t.tag_name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Image Manager ────────────────────────────────────────────
// NOTE: image operations are fire-and-forget side effects that don't need Redux caching.
// They are kept as direct API calls intentionally.
function ImageManager({ productId, onPrimaryChanged }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const loadImages = useCallback(async () => {
        setLoading(true);
        try {
            const data = await productApi.getProductImages(productId);
            setImages(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => { loadImages(); }, [loadImages]);

    const uploadFiles = async (files) => {
        if (!files || files.length === 0) return;
        setError('');
        setUploading(true);

        const previews = Array.from(files).map(f => ({
            name: f.name,
            previewUrl: URL.createObjectURL(f),
            status: 'uploading',
        }));
        setUploadProgress(previews);

        let newPrimaryUrl = null;

        for (let i = 0; i < files.length; i++) {
            const isFirst = images.length === 0 && i === 0;
            try {
                const result = await productApi.images.upload(productId, files[i], isFirst);
                setUploadProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'done' } : p));
                if (result.is_primary) newPrimaryUrl = result.image_url;
            } catch (e) {
                setUploadProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error', error: e.message } : p));
            }
        }

        await loadImages();
        setUploadProgress([]);
        setUploading(false);

        if (newPrimaryUrl) onPrimaryChanged(newPrimaryUrl);
    };

    const handleFiles = (files) => uploadFiles(files);
    const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = () => setIsDragOver(false);

    const handleSetPrimary = async (img) => {
        setError('');
        try {
            await productApi.images.setPrimary(productId, img.image_id);
            await loadImages();
            onPrimaryChanged(img.image_url);
        } catch (e) { setError(e.message); }
    };

    const handleDelete = async (img) => {
        setError('');
        try {
            const wasPrimary = img.is_primary;
            await productApi.images.delete(productId, img.image_id);
            const updatedList = await productApi.getProductImages(productId);
            setImages(updatedList);
            if (wasPrimary) {
                const newPrimary = updatedList.find(i => i.is_primary);
                onPrimaryChanged(newPrimary?.image_url || null);
            }
        } catch (e) { setError(e.message); }
    };

    return (
        <div className="space-y-4">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-stone-500">
                <Images size={12} /> Product Images
                <span className="text-stone-700 normal-case font-normal ml-1">
                    {images.length > 0 ? `${images.length} image${images.length > 1 ? 's' : ''}` : ''}
                </span>
            </p>

            {loading ? (
                <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-24 w-24 shrink-0 rounded-xl bg-white/5 animate-pulse" />)}
                </div>
            ) : images.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-1 pr-1">
                    {images.map(img => (
                        <div key={img.image_id}
                            className={`group relative shrink-0 h-24 w-24 rounded-xl overflow-hidden border-2 transition-all ${img.is_primary ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-white/8 hover:border-white/25'}`}>
                            <img src={img.image_url} alt="" className="h-full w-full object-cover"
                                onError={e => { e.currentTarget.src = PLACEHOLDER; }} />

                            {img.is_primary && (
                                <div className="absolute top-1 left-1">
                                    <span className="flex items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-stone-950">
                                        <Star size={8} fill="currentColor" /> PRIMARY
                                    </span>
                                </div>
                            )}

                            <div className="absolute inset-0 flex flex-col items-end justify-start gap-1.5 p-1.5 bg-stone-950/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!img.is_primary && (
                                    <button onClick={() => handleSetPrimary(img)} title="Set as primary"
                                        className="rounded-full bg-amber-500/90 p-1 text-stone-950 hover:bg-amber-400 transition-colors shadow">
                                        <Star size={11} />
                                    </button>
                                )}
                                <button onClick={() => handleDelete(img)} title="Delete"
                                    className="rounded-full bg-red-500/80 p-1 text-white hover:bg-red-500 transition-colors shadow">
                                    <Trash2 size={11} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {uploadProgress.map((p, i) => (
                        <div key={i} className="relative shrink-0 h-24 w-24 rounded-xl overflow-hidden border-2 border-white/10">
                            <img src={p.previewUrl} alt="" className="h-full w-full object-cover opacity-40" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                {p.status === 'uploading' && <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />}
                                {p.status === 'done' && <CheckCircle size={18} className="text-green-400" />}
                                {p.status === 'error' && <X size={18} className="text-red-400" />}
                            </div>
                        </div>
                    ))}
                </div>
            ) : uploadProgress.length === 0 ? (
                <p className="text-xs text-stone-600 italic">No images yet.</p>
            ) : null}

            <div
                onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 px-4 text-center transition-all cursor-pointer
                    ${isDragOver ? 'border-amber-500/60 bg-amber-500/10 scale-[1.01]' : 'border-white/10 bg-white/3 hover:border-white/25 hover:bg-white/5'}
                    ${uploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
            >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isDragOver ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-stone-500'}`}>
                    <Upload size={20} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-stone-300">
                        {isDragOver ? 'Drop to upload' : 'Drag & drop images here'}
                    </p>
                    <p className="text-xs text-stone-600 mt-0.5">or click to browse · JPG, PNG, WebP · max 10 MB each</p>
                </div>
                {uploading && <p className="text-xs text-amber-400 animate-pulse">Uploading to Cloudinary…</p>}
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
            </div>

            {error && (
                <p className="flex items-center gap-1.5 text-xs text-red-400">
                    <AlertCircle size={12} /> {error}
                </p>
            )}
        </div>
    );
}

// ─── Product Detail Drawer ────────────────────────────────────
function ProductDetailDrawer({ product: initial, categories, tags, onClose, onDeleted, onUpdated }) {
    const dispatch = useAppDispatch();
    const [product, setProduct] = useState(initial);
    const [editing, setEditing] = useState(false);

    const initialTagIds = initial.tag_ids
        ? String(initial.tag_ids).split(',').map(Number)
        : [];

    const [form, setForm] = useState({ ...initial, tag_ids: initialTagIds });
    const [saving, setSaving] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);

    const stock = STOCK_STATUS(product.stock_quantity);

    const handleSave = async () => {
        setError(''); setSaving(true);
        try {
            const payload = {
                name: form.name, description: form.description, image_url: form.image_url,
                price: parseFloat(form.price),
                discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
                material: form.material, color: form.color,
                length: form.length ? parseFloat(form.length) : null,
                width: form.width ? parseFloat(form.width) : null,
                height: form.height ? parseFloat(form.height) : null,
                stock_quantity: parseInt(form.stock_quantity, 10),
                category_id: parseInt(form.category_id, 10),
                tag_ids: form.tag_ids || [],
            };
            await dispatch(updateAdminProduct({ id: product.product_id, payload })).unwrap();
            const updatedProduct = {
                ...product, ...payload,
                category_name: categories.find(c => c.category_id === payload.category_id)?.category_name || product.category_name
            };
            setProduct(updatedProduct);
            onUpdated(updatedProduct);
            setEditing(false);
            setToast({ msg: 'Product updated!', type: 'success' });
        } catch (e) { setError(e || 'Update failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await dispatch(deleteAdminProduct(product.product_id)).unwrap();
            onDeleted(product.product_id);
            onClose();
        } catch (e) {
            setToast({ msg: e || 'Delete failed', type: 'error' });
            setConfirm(false);
        }
    };

    const handlePrimaryChanged = (newUrl) => {
        const updated = { ...product, image_url: newUrl };
        setProduct(updated);
        onUpdated(updated);
    };

    return (
        <>
            <Drawer
                title={editing ? 'Edit Product' : product.name}
                subtitle={`#${product.product_id} · ${product.category_name}`}
                icon={Package}
                onClose={onClose}
                footer={
                    <div className="flex items-center justify-between">
                        <button onClick={() => setConfirm(true)}
                            className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 size={14} /> Deactivate
                        </button>
                        <div className="flex gap-3">
                            {editing ? (
                                <>
                                    <button onClick={() => { setEditing(false); setError(''); }}
                                        className="rounded-xl border border-white/10 px-5 py-2 text-sm font-semibold text-stone-400 hover:bg-white/5 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleSave} disabled={saving}
                                        className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50 transition-all">
                                        {saving ? 'Saving…' : 'Save Changes'}
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => { setForm({ ...product, tag_ids: initialTagIds }); setEditing(true); }}
                                    className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2 text-sm font-semibold text-stone-300 hover:bg-white/10 transition-colors">
                                    <Pencil size={14} /> Edit
                                </button>
                            )}
                        </div>
                    </div>
                }
            >
                {editing ? (
                    <div className="space-y-5">
                        <ProductForm form={form} setForm={setForm} categories={categories} tags={tags} />
                        <ErrorBanner error={error} />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="relative overflow-hidden rounded-2xl h-52 bg-stone-800 shadow-xl">
                            <img src={product.image_url || PLACEHOLDER} alt={product.name}
                                className="h-full w-full object-cover"
                                onError={e => { e.currentTarget.src = PLACEHOLDER; }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 to-transparent" />
                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                {product.is_active
                                    ? <span className="flex items-center gap-1 rounded-full border border-green-500/30 bg-stone-900/80 px-2.5 py-0.5 text-xs font-bold text-green-400 backdrop-blur-sm"><CheckCircle size={11} /> Active</span>
                                    : <span className="flex items-center gap-1 rounded-full border border-stone-600 bg-stone-900/80 px-2.5 py-0.5 text-xs font-bold text-stone-500 backdrop-blur-sm"><XCircle size={11} /> Inactive</span>
                                }
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/8 bg-stone-900/50 p-4">
                            <ImageManager productId={product.product_id} onPrimaryChanged={handlePrimaryChanged} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-white/3 px-4 py-3">
                                <p className="text-[10px] uppercase tracking-wider text-stone-600 mb-1">Price</p>
                                <p className="text-xl font-black text-white">₹{Number(product.price).toLocaleString('en-IN')}</p>
                                {product.discount_price && <p className="text-xs text-amber-400 mt-0.5">Sale: ₹{Number(product.discount_price).toLocaleString('en-IN')}</p>}
                            </div>
                            <div className="rounded-xl bg-white/3 px-4 py-3">
                                <p className="text-[10px] uppercase tracking-wider text-stone-600 mb-1">Stock</p>
                                <p className="text-xl font-black text-white">{product.stock_quantity}</p>
                                <span className={`text-[10px] font-bold rounded-full border px-2 py-0.5 mt-1 inline-block ${stock.cls}`}>{stock.label}</span>
                            </div>
                        </div>

                        {product.description && (
                            <div className="rounded-xl bg-white/3 px-4 py-3">
                                <p className="text-[10px] uppercase tracking-wider text-stone-600 mb-1">Description</p>
                                <p className="text-sm text-stone-300 leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ['Category', product.category_name],
                                ['Material', product.material],
                                ['Color', product.color],
                                ['Dimensions', product.length ? `${product.length} × ${product.width} × ${product.height} cm` : null],
                            ].filter(([, v]) => v).map(([label, value]) => (
                                <div key={label} className="rounded-xl bg-white/3 px-3 py-2.5">
                                    <p className="text-[9px] uppercase tracking-wider text-stone-600 mb-0.5">{label}</p>
                                    <p className="text-xs font-semibold text-stone-300">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Drawer>

            {confirm && (
                <ConfirmDialog
                    message={`Deactivate "${product.name}"? (soft delete)`}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirm(false)}
                />
            )}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
}

// ─── Add Product Drawer ───────────────────────────────────────
function AddProductDrawer({ categories, tags, onClose, onSuccess }) {
    const dispatch = useAppDispatch();
    const [form, setForm] = useState({
        name: '', category_id: '', description: '', price: '',
        discount_price: '', material: '', color: '',
        length: '', width: '', height: '', stock_quantity: '', tag_ids: [],
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSubmitting(true);
        try {
            const payload = {
                ...form,
                price: parseFloat(form.price),
                discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
                length: form.length ? parseFloat(form.length) : null,
                width: form.width ? parseFloat(form.width) : null,
                height: form.height ? parseFloat(form.height) : null,
                stock_quantity: parseInt(form.stock_quantity, 10),
                category_id: parseInt(form.category_id, 10),
            };
            await dispatch(createAdminProduct(payload)).unwrap();
            onSuccess('Product added! Open it to upload images.');
        } catch (e) { setError(e || 'Failed to create product'); }
        finally { setSubmitting(false); }
    };

    return (
        <Drawer title="Add New Product" subtitle="Fill in the details below" icon={Plus} onClose={onClose}
            footer={
                <div className="flex items-center justify-end gap-3">
                    <button onClick={onClose} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-stone-400 hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={submitting}
                        className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-50">
                        {submitting && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />}
                        {submitting ? 'Creating…' : 'Create Product'}
                    </button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-1">
                <ProductForm form={form} setForm={setForm} categories={categories} tags={tags} />
                <div className="pt-2 rounded-xl border border-white/8 bg-white/3 px-4 py-3 mt-4">
                    <p className="text-xs text-stone-500 flex items-center gap-1.5">
                        <Upload size={12} className="text-amber-500" />
                        Images can be uploaded after the product is created by clicking on it in the grid.
                    </p>
                </div>
                <div className="pt-3"><ErrorBanner error={error} /></div>
            </form>
        </Drawer>
    );
}

// ─── Product Card ─────────────────────────────────────────────
function ProductCard({ p, onClick }) {
    const stock = STOCK_STATUS(p.stock_quantity);
    return (
        <div onClick={() => onClick(p)}
            className="group relative flex flex-col rounded-2xl border border-white/8 bg-stone-900 overflow-hidden hover:border-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer">
            <div className="relative h-44 overflow-hidden bg-stone-800">
                <img src={p.image_url || PLACEHOLDER} alt={p.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.currentTarget.src = PLACEHOLDER; }} />
                <div className="absolute top-3 right-3">
                    {p.is_active
                        ? <span className="flex items-center gap-1 rounded-full border border-green-500/30 bg-stone-900/80 px-2 py-0.5 text-[10px] font-bold text-green-400 backdrop-blur-sm"><CheckCircle size={10} /> Active</span>
                        : <span className="flex items-center gap-1 rounded-full border border-stone-700 bg-stone-900/80 px-2 py-0.5 text-[10px] font-bold text-stone-500 backdrop-blur-sm"><XCircle size={10} /> Inactive</span>}
                </div>
                <div className="absolute bottom-3 left-3">
                    <span className="rounded-full border border-amber-500/30 bg-stone-900/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400 backdrop-blur-sm">{p.category_name}</span>
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                    <p className="text-[10px] font-mono text-stone-600">#{p.product_id}</p>
                    <h3 className="mt-0.5 font-semibold text-stone-100 leading-snug line-clamp-2">{p.name}</h3>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-white">₹{Number(p.price).toLocaleString('en-IN')}</span>
                    {p.discount_price && <span className="text-sm font-semibold text-amber-400">→ ₹{Number(p.discount_price).toLocaleString('en-IN')}</span>}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${stock.cls}`}>{stock.label}</span>
                    {p.material && <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5 text-[10px] text-stone-400">{p.material}</span>}
                    {p.color && <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5 text-[10px] text-stone-400">{p.color}</span>}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ProductsPage() {
    const dispatch = useAppDispatch();
    const products = useAppSelector(selectAdminProducts);
    const categories = useAppSelector(selectAdminCategories);
    const tags = useAppSelector(selectAdminTags);
    const loading = useAppSelector(selectAdminProductsLoading);
    const error = useAppSelector(selectAdminProductsError);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');

    useEffect(() => {
        dispatch(clearAdminProductsError());
        dispatch(fetchAdminProductsAll());
    }, [dispatch]);

    const handleDeleted = (id) => setSelectedProduct(null);
    const handleUpdated = (updated) => setSelectedProduct(updated);
    const handleAdded = (msg) => {
        setShowAdd(false);
        setToast({ msg, type: 'success' });
        // Re-fetch to get fully populated product with category_name etc.
        dispatch(fetchAdminProducts());
    };

    const inStock = products.filter(p => p.stock_quantity > 0).length;
    const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length;

    const filtered = products
        .filter(p => catFilter === 'all' || String(p.category_id) === catFilter || p.category_name === catFilter)
        .filter(p =>
            search === '' ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.category_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.tags || '').toLowerCase().includes(search.toLowerCase())
        );

    return (
        <div className="min-h-full bg-stone-950 p-8 space-y-10">
            {/* Sticky Header Section */}
            <div className="sticky top-0 z-30 -mx-8 -mt-8 px-8 py-8 pb-2 space-y-8 bg-stone-950/80 backdrop-blur-md border-b border-white/5">
                <PageHeader
                    icon={Package} iconColor="text-amber-400" iconBg="bg-amber-500/15"
                    title="Products"
                    subtitle={`${products.length} items · ${inStock} in stock${lowStock > 0 ? ` · ${lowStock} low` : ''}`}
                    action={
                        <button onClick={() => setShowAdd(true)}
                            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/20">
                            <Plus size={17} /> Add Product
                        </button>
                    }
                />

                <div className="grid grid-cols-3 gap-4">
                    <StatCard icon={Package} label="Total Products" value={products.length} color="border-amber-500/20 text-amber-400" />
                    <StatCard icon={BarChart3} label="In Stock" value={inStock} color="border-green-500/20 text-green-400" />
                    <StatCard icon={AlertCircle} label="Low Stock" value={lowStock} color="border-yellow-500/20 text-yellow-400" />
                </div>

                <div className='px-4 py border-t border-white/5 '>
                    <ProductFilter
                        categories={categories}
                        catFilter={catFilter}
                        setCatFilter={setCatFilter}
                        setSearch={setSearch}
                        search={search}
                    />
                </div>
            </div>

            <ErrorBanner error={error} />

            {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="rounded-2xl bg-stone-900 overflow-hidden animate-pulse">
                            <div className="h-44 bg-white/5" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 rounded bg-white/5 w-3/4" />
                                <div className="h-6 rounded bg-white/5 w-1/2" />
                                <div className="h-4 rounded bg-white/5 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState icon={Package} message={products.length === 0 ? 'No products yet. Add one!' : 'No products match your filter.'} />
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map(p => <ProductCard key={p.product_id} p={p} onClick={setSelectedProduct} />)}
                </div>
            )}

            {selectedProduct && (
                <ProductDetailDrawer
                    product={selectedProduct}
                    categories={categories}
                    tags={tags}
                    onClose={() => setSelectedProduct(null)}
                    onDeleted={(id) => { handleDeleted(id); setSelectedProduct(null); setToast({ msg: 'Product deactivated.', type: 'success' }); }}
                    onUpdated={(p) => { handleUpdated(p); setSelectedProduct(p); }}
                />
            )}
            {showAdd && (
                <AddProductDrawer categories={categories} tags={tags} onClose={() => setShowAdd(false)} onSuccess={handleAdded} />
            )}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
