import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../api/productApi';
import ProductCard from '../components/products/ProductCard';
import { Search, Filter, X, Tag, Loader2 } from 'lucide-react';

export default function Products() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Live data from backend
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Tag-filtered product list (populated by backend call when tags are selected)
    const [tagFilteredProducts, setTagFilteredProducts] = useState(null); // null = "not in tag-filter mode"
    const [tagFetching, setTagFetching] = useState(false);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);   // array of tag_id (number)
    const [showFilters, setShowFilters] = useState(false);

    const selectedCategoryId = searchParams.get('category_id')
        ? Number(searchParams.get('category_id'))
        : null;

    // Fetch products, categories, and tags in parallel
    useEffect(() => {
        Promise.all([
            productApi.getProducts(),
            productApi.getCategories(),
            productApi.getOrgTags(),
        ])
            .then(([prods, cats, tgs]) => {
                setProducts(prods);
                setCategories(cats);
                setTags(tgs);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const handleCategoryClick = (categoryId) => {
        if (!categoryId) {
            searchParams.delete('category_id');
        } else {
            searchParams.set('category_id', categoryId);
        }
        setSearchParams(searchParams);
    };

    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    // When tags are selected, call the backend tag endpoint.
    // The backend returns products that have ALL selected tags (HAVING COUNT logic).
    // When tags are cleared, reset to the full product list (tagFilteredProducts = null).
    useEffect(() => {
        if (selectedTags.length === 0) {
            setTagFilteredProducts(null);
            return;
        }
        setTagFetching(true);
        productApi.getProductsByTags(selectedTags)
            .then(data => setTagFilteredProducts(data))
            .catch(() => setTagFilteredProducts([]))
            .finally(() => setTagFetching(false));
    }, [selectedTags]);

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedTags([]);
        setTagFilteredProducts(null);
        searchParams.delete('category_id');
        setSearchParams(searchParams);
    };

    // Base list = tag-filtered if tags are selected, otherwise all products
    const baseList = tagFilteredProducts !== null ? tagFilteredProducts : products;

    // Apply keyword and category filters on top of the base list
    const filteredProducts = useMemo(() => {
        return baseList.filter(p => {
            const q = searchQuery.toLowerCase();
            const matchSearch = !q ||
                p.name.toLowerCase().includes(q) ||
                (p.description || '').toLowerCase().includes(q) ||
                (p.category_name || '').toLowerCase().includes(q) ||
                (p.tags || '').toLowerCase().includes(q);
            const matchCategory = !selectedCategoryId || p.category_id === selectedCategoryId;
            return matchSearch && matchCategory;
        });
    }, [baseList, searchQuery, selectedCategoryId]);

    const hasActiveFilters = searchQuery || selectedCategoryId || selectedTags.length > 0;

    if (error) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
                <p className="text-stone-500 mb-4">Could not load products.</p>
                <p className="text-sm text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-12 flex flex-col space-y-8 md:flex-row md:items-end md:justify-between md:space-y-0 text-center md:text-left">
                <div className="flex-1">
                    <h1 className="text-4xl font-serif font-black tracking-tighter text-stone-900 sm:text-5xl">The Collection</h1>
                    <p className="mt-4 max-w-md text-stone-500">
                        Explore our complete range of furniture, designed for every room in your modern home.
                    </p>
                </div>

                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search pieces..."
                            className="w-full rounded-full border border-stone-200 bg-white py-3 pl-10 pr-6 text-sm focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 sm:w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center space-x-2 rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-bold text-stone-900 transition-all hover:bg-stone-50 active:scale-95 md:hidden"
                    >
                        <Filter size={18} />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-12 lg:flex-row">
                {/* Desktop Sidebar */}
                <aside className="hidden w-64 flex-shrink-0 lg:block">
                    <div className="sticky top-32 space-y-10">
                        {/* Categories */}
                        <div>
                            <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-stone-900">Categories</h3>
                            <div className="space-y-4">
                                <button
                                    onClick={() => handleCategoryClick(null)}
                                    className={`block text-sm transition-colors hover:text-stone-900 ${!selectedCategoryId ? 'font-bold text-stone-900 border-l-2 border-stone-900 pl-4' : 'text-stone-500 pl-4'}`}
                                >
                                    All
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.category_id}
                                        onClick={() => handleCategoryClick(cat.category_id)}
                                        className={`block text-sm transition-colors hover:text-stone-900 ${selectedCategoryId === cat.category_id ? 'font-bold text-stone-900 border-l-2 border-stone-900 pl-4' : 'text-stone-500 pl-4'}`}
                                    >
                                        {cat.category_name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div>
                                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-stone-900 flex items-center gap-1.5">
                                    <Tag size={12} /> Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <button
                                            key={tag.tag_id}
                                            onClick={() => toggleTag(tag.tag_id)}
                                            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${selectedTags.includes(tag.tag_id)
                                                ? 'bg-stone-900 text-white border-stone-900'
                                                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                                                }`}
                                        >
                                            {tag.tag_name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Clear filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                            >
                                <X size={12} /> Clear filters
                            </button>
                        )}

                        {/* Help box */}
                        <div className="rounded-2xl bg-stone-900 p-8 text-white">
                            <h4 className="mb-2 text-lg font-serif font-bold">Need Help?</h4>
                            <p className="mb-6 text-xs text-stone-400 leading-relaxed">Our design experts are ready to help you find the perfect piece.</p>
                            <button className="text-xs font-bold uppercase tracking-widest underline decoration-stone-600 underline-offset-8 hover:text-stone-200">Contact Us</button>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    {/* Active filter chips */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {selectedCategoryId && categories.find(c => c.category_id === selectedCategoryId) && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                                    {categories.find(c => c.category_id === selectedCategoryId).category_name}
                                    <button onClick={() => handleCategoryClick(null)}><X size={10} /></button>
                                </span>
                            )}
                            {selectedTags.map(tid => {
                                const t = tags.find(tg => tg.tag_id === tid);
                                return t ? (
                                    <span key={tid} className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                                        {t.tag_name}
                                        <button onClick={() => toggleTag(tid)}><X size={10} /></button>
                                    </span>
                                ) : null;
                            })}
                        </div>
                    )}

                    {/* Tag loading indicator */}
                    {tagFetching && (
                        <div className="flex items-center gap-2 mb-6 text-sm text-stone-400">
                            <Loader2 size={16} className="animate-spin" />
                            <span>Refining collection by tags…</span>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse rounded-xl bg-stone-100">
                                    <div className="aspect-[4/5] bg-stone-200 rounded-t-xl" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-3 w-20 rounded bg-stone-200" />
                                        <div className="h-5 w-40 rounded bg-stone-200" />
                                        <div className="h-10 rounded-lg bg-stone-200" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <>
                            <p className="mb-6 text-sm text-stone-400">{filteredProducts.length} piece{filteredProducts.length !== 1 ? 's' : ''} found</p>
                            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.product_id} product={product} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-200 p-12 text-center">
                            <div className="mb-6 rounded-full bg-stone-100 p-6 text-stone-400">
                                <Search size={48} />
                            </div>
                            <h3 className="text-xl font-serif font-bold text-stone-900">No pieces found</h3>
                            <p className="mt-2 max-w-xs text-stone-500">Try adjusting your search or filters.</p>
                            <button
                                onClick={clearAllFilters}
                                className="mt-8 text-sm font-bold uppercase tracking-widest text-stone-900 underline underline-offset-8"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:hidden">
                    <div className="w-full rounded-t-3xl bg-white p-8 max-h-[80vh] overflow-y-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <h3 className="text-xl font-serif font-bold">Filters</h3>
                            <button onClick={() => setShowFilters(false)}><X size={24} /></button>
                        </div>

                        <div className="mb-8">
                            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-stone-400">Categories</h4>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => { handleCategoryClick(null); setShowFilters(false); }}
                                    className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${!selectedCategoryId ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                                >All</button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.category_id}
                                        onClick={() => { handleCategoryClick(cat.category_id); setShowFilters(false); }}
                                        className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${selectedCategoryId === cat.category_id ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                                    >{cat.category_name}</button>
                                ))}
                            </div>
                        </div>

                        {tags.length > 0 && (
                            <div className="mb-8">
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-stone-400">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <button
                                            key={tag.tag_id}
                                            onClick={() => toggleTag(tag.tag_id)}
                                            className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition-all ${selectedTags.includes(tag.tag_id) ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200'}`}
                                        >{tag.tag_name}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setShowFilters(false)}
                            className="w-full rounded-xl bg-stone-900 py-4 font-bold text-white transition-all active:scale-95"
                        >Show Results</button>
                    </div>
                </div>
            )}
        </div>
    );
}
