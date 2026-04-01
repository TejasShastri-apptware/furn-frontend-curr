import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { Plus, ShoppingBag } from 'lucide-react';

export default function ProductCard({ product }) {
    const dispatch = useDispatch();
    const outOfStock = product.stock_quantity === 0;

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (outOfStock) return;
        try {
            await dispatch(addToCart({ product_id: product.product_id, quantity: 1 }));
        } catch (err) {
            console.error('[ProductCard] addToCart failed:', err.message);
        }
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white transition-all hover:shadow-2xl hover:-translate-y-1">
            <Link to={`/store/products/${product.product_id}`} className="aspect-[4/5] overflow-hidden bg-stone-100 relative">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-stone-300">
                        <img src='https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800' className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt='product_image' />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded-full bg-white/90 px-4 py-1 text-xs font-bold uppercase tracking-widest text-stone-900">
                            Out of Stock
                        </span>
                    </div>
                )}
            </Link>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                        {product.category_name}
                    </span>
                    <div className="text-right">
                        {product.discount_price ? (
                            <div className="flex items-center gap-1">
                                <span className="text-xs line-through text-stone-400">₹{Number(product.price).toLocaleString('en-IN')}</span>
                                <span className="text-sm font-bold text-stone-900">₹{Number(product.discount_price).toLocaleString('en-IN')}</span>
                            </div>
                        ) : (
                            <span className="text-sm font-medium text-stone-900">₹{Number(product.price).toLocaleString('en-IN')}</span>
                        )}
                    </div>
                </div>

                <Link to={`/store/products/${product.product_id}`} className="mb-4 block">
                    <h3 className="text-lg font-serif font-bold text-stone-800 transition-colors hover:text-stone-600">
                        {product.name}
                    </h3>
                </Link>

                <button
                    onClick={handleAddToCart}
                    disabled={outOfStock}
                    className="mt-auto flex w-full items-center justify-center space-x-2 rounded-lg bg-stone-900 py-3 text-sm font-bold text-white transition-all hover:bg-stone-800 active:scale-95 disabled:bg-stone-300 disabled:cursor-not-allowed"
                >
                    <Plus size={16} />
                    <span>{outOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
            </div>
        </div>
    );
}