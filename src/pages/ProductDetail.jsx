import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import ProductCard from '../components/products/ProductCard';
import { ShoppingBag, ChevronLeft, ShieldCheck, Truck, Tag, Ruler, Palette, Layers, ChevronRight } from 'lucide-react';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800';

export default function ProductDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [images, setImages] = useState([]);   // product_images rows
    const [activeIdx, setActiveIdx] = useState(0);
    const [tags, setTags] = useState([]);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);
    const [addedMsg, setAddedMsg] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        setProduct(null);
        setImages([]);
        setActiveIdx(0);
        setRelated([]);

        Promise.all([
            productApi.getProductById(id),
            productApi.getProductTags(id),
            productApi.getProductImages(id),
        ])
            .then(([prod, tgs, imgs]) => {
                setProduct(prod);
                setTags(tgs);
                // If no dedicated images, fall back to the products.image_url field
                if (imgs.length > 0) {
                    setImages(imgs);
                } else if (prod.image_url) {
                    setImages([{ image_id: 0, image_url: prod.image_url, is_primary: true }]);
                }
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    // Fetch related products once product is known
    useEffect(() => {
        if (!product) return;
        productApi.getProducts()
            .then(all => {
                const rel = all.filter(p =>
                    p.category_id === product.category_id && p.product_id !== product.product_id
                ).slice(0, 4);
                setRelated(rel);
            })
            .catch(() => { });
    }, [product]);

    const handleAddToCart = async () => {
        if (!product || product.stock_quantity === 0 || adding) return;
        if (!localStorage.getItem('user_id')) {
            navigate('/signin', { state: { from: location } });
            return;
        }
        setAdding(true);
        try {
            await dispatch(addToCart({ product_id: product.product_id, quantity: 1 }));
            setAddedMsg('Added to cart!');
            setTimeout(() => setAddedMsg(''), 2000);
        } catch (e) {
            setAddedMsg('Failed to add — please try again.');
            setTimeout(() => setAddedMsg(''), 3000);
        } finally {
            setAdding(false);
        }
    };

    const prevImage = useCallback(() =>
        setActiveIdx(i => (i - 1 + images.length) % images.length), [images.length]);
    const nextImage = useCallback(() =>
        setActiveIdx(i => (i + 1) % images.length), [images.length]);

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 animate-pulse">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
                    <div className="space-y-3">
                        <div className="aspect-[4/5] rounded-3xl bg-stone-100" />
                        <div className="flex gap-2">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-16 w-16 rounded-xl bg-stone-100" />)}
                        </div>
                    </div>
                    <div className="space-y-6 pt-4">
                        <div className="h-4 w-32 rounded bg-stone-100" />
                        <div className="h-12 w-3/4 rounded bg-stone-100" />
                        <div className="h-8 w-24 rounded bg-stone-100" />
                        <div className="space-y-2">
                            <div className="h-4 w-full rounded bg-stone-100" />
                            <div className="h-4 w-5/6 rounded bg-stone-100" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-serif font-black text-stone-900">Piece not found</h2>
                <p className="mt-2 text-stone-500 text-sm">{error}</p>
                <Link to="/store/products" className="mt-4 text-stone-500 underline underline-offset-4">Return to collection</Link>
            </div>
        );
    }

    const outOfStock = product.stock_quantity === 0;
    const effectivePrice = product.discount_price || product.price;
    const activeImage = images[activeIdx]?.image_url || PLACEHOLDER;

    return (
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <Link to="/store/products" className="mb-12 inline-flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-stone-400 transition-colors hover:text-stone-900">
                <ChevronLeft size={16} />
                <span>Back to collection</span>
            </Link>

            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">

                {/* ── Image Gallery ─────────────────────────────────── */}
                <div className="space-y-3">
                    {/* Main image viewer */}
                    <div className="relative overflow-hidden rounded-3xl bg-stone-100 aspect-[4/5] group">
                        <img
                            key={activeImage}
                            src={activeImage}
                            alt={product.name}
                            className="h-full w-full object-cover transition-opacity duration-300"
                            onError={e => { e.currentTarget.src = PLACEHOLDER; }}
                        />

                        {/* Out of stock overlay */}
                        {outOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <span className="rounded-full bg-white/90 px-6 py-2 text-sm font-bold uppercase tracking-widest text-stone-900">Out of Stock</span>
                            </div>
                        )}

                        {/* Prev / Next arrows — only if multiple images */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-800 shadow backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-800 shadow backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                >
                                    <ChevronRight size={18} />
                                </button>
                                {/* Dot indicators */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveIdx(i)}
                                            className={`h-1.5 rounded-full transition-all ${i === activeIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Thumbnail strip — only if 2+ images */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {images.map((img, i) => (
                                <button
                                    key={img.image_id}
                                    onClick={() => setActiveIdx(i)}
                                    className={`relative shrink-0 h-16 w-16 overflow-hidden rounded-xl border-2 transition-all ${i === activeIdx
                                        ? 'border-stone-900 shadow-md scale-105'
                                        : 'border-transparent hover:border-stone-300 opacity-70 hover:opacity-100'}`}
                                >
                                    <img
                                        src={img.image_url}
                                        alt={`View ${i + 1}`}
                                        className="h-full w-full object-cover"
                                        onError={e => { e.currentTarget.src = PLACEHOLDER; }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Product Info ───────────────────────────────────── */}
                <div className="flex flex-col">
                    <div className="mb-6">
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">{product.category_name}</span>
                        <h1 className="mt-2 text-4xl font-serif font-black tracking-tighter text-stone-900 sm:text-5xl">{product.name}</h1>

                        {/* Price */}
                        <div className="mt-4 flex items-baseline gap-3">
                            <p className="text-2xl font-bold text-stone-900">₹{Number(effectivePrice).toLocaleString('en-IN')}</p>
                            {product.discount_price && (
                                <p className="text-lg line-through text-stone-400">₹{Number(product.price).toLocaleString('en-IN')}</p>
                            )}
                        </div>

                        <p className={`mt-2 text-sm font-semibold ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
                            {outOfStock ? 'Out of Stock' : `${product.stock_quantity} in stock`}
                        </p>
                    </div>

                    {product.description && (
                        <p className="mb-8 text-stone-600 leading-relaxed">{product.description}</p>
                    )}

                    {/* Specs */}
                    {(product.material || product.color || product.length || product.width || product.height) && (
                        <div className="mb-8 grid grid-cols-2 gap-3">
                            {product.material && (
                                <div className="flex items-center gap-2 rounded-xl bg-stone-50 p-3">
                                    <Layers size={14} className="text-stone-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Material</p>
                                        <p className="text-sm font-semibold text-stone-700">{product.material}</p>
                                    </div>
                                </div>
                            )}
                            {product.color && (
                                <div className="flex items-center gap-2 rounded-xl bg-stone-50 p-3">
                                    <Palette size={14} className="text-stone-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Color</p>
                                        <p className="text-sm font-semibold text-stone-700">{product.color}</p>
                                    </div>
                                </div>
                            )}
                            {(product.length || product.width || product.height) && (
                                <div className="col-span-2 flex items-center gap-2 rounded-xl bg-stone-50 p-3">
                                    <Ruler size={14} className="text-stone-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Dimensions (L × W × H cm)</p>
                                        <p className="text-sm font-semibold text-stone-700">
                                            {[product.length, product.width, product.height].map(v => v ?? '—').join(' × ')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="mb-8 flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <span key={tag.tag_id} className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-600">
                                    <Tag size={10} /> {tag.tag_name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Trust badges */}
                    <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex items-center space-x-4 rounded-2xl bg-stone-50 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-900 shadow-sm">
                                <Truck size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-stone-900">Fast Delivery</p>
                                <p className="text-xs text-stone-500">Free on orders over ₹500</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 rounded-2xl bg-stone-50 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-900 shadow-sm">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-stone-900">Warranty</p>
                                <p className="text-xs text-stone-500">2-Year Structural Warranty</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="space-y-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={outOfStock || adding}
                            className="flex w-full items-center justify-center space-x-3 rounded-2xl bg-stone-900 py-6 text-lg font-bold text-white transition-all hover:bg-stone-800 active:scale-95 disabled:bg-stone-300 disabled:cursor-not-allowed"
                        >
                            {adding ? (
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                                <>
                                    <ShoppingBag size={20} />
                                    <span>{outOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                                </>
                            )}
                        </button>
                        {addedMsg && (
                            <p className={`text-center text-sm font-semibold ${addedMsg.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
                                {addedMsg}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {related.length > 0 && (
                <section className="mt-32">
                    <h2 className="mb-12 font-serif text-3xl font-black tracking-tighter text-stone-900">You May Also Like</h2>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {related.map(p => <ProductCard key={p.product_id} product={p} />)}
                    </div>
                </section>
            )}
        </div>
    );
}
