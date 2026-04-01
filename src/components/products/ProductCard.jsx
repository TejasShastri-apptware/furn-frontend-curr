import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';
import { addToCart, updateQuantity, removeFromCart, selectCartItemByProductId } from '../../store/slices/cartSlice';
import { toggleWishlist, selectIsWishlisted } from '../../store/slices/wishlistSlice';
import { Plus, Minus, ShoppingBag, Heart, Trash2 } from 'lucide-react';

export default function ProductCard({ product }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);
    const cartItem = useAppSelector(state => selectCartItemByProductId(state, product.product_id));
    const isWishlisted = useAppSelector(state => selectIsWishlisted(state, product.product_id));
    const outOfStock = product.stock_quantity === 0;

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (outOfStock) return;
        
        if (!user) {
            navigate('/signin');
            return;
        }

        try {
            await dispatch(addToCart({ product_id: product.product_id, quantity: 1 }));
        } catch (err) {
            console.error('[ProductCard] addToCart failed:', err.message);
        }
    };

    const handleIncrease = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await dispatch(updateQuantity({ cart_item_id: cartItem.cart_item_id, quantity: cartItem.quantity + 1 }));
    };

    const handleDecrease = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (cartItem.quantity > 1) {
            await dispatch(updateQuantity({ cart_item_id: cartItem.cart_item_id, quantity: cartItem.quantity - 1 }));
        } else {
            await dispatch(removeFromCart(cartItem.cart_item_id));
        }
    };

    const handleToggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!user) {
            navigate('/signin');
            return;
        }

        try {
            await dispatch(toggleWishlist(product));
        } catch (err) {
            console.error('[ProductCard] toggleWishlist failed:', err.message);
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
                
                {/* Wishlist Toggle */}
                <button
                    onClick={handleToggleWishlist}
                    className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-900 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-95"
                >
                    <Heart 
                        size={18} 
                        className={`transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-stone-400'}`} 
                    />
                </button>

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

                {cartItem ? (
                    <div className="mt-auto flex w-full items-center justify-between rounded-lg bg-stone-100 p-1">
                        <button
                            onClick={handleDecrease}
                            className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-stone-600 shadow-sm transition-all hover:bg-stone-50 active:scale-90"
                        >
                            {cartItem.quantity === 1 ? <Trash2 size={16} className="text-red-500" /> : <Minus size={16} />}
                        </button>
                        
                        <span className="text-sm font-bold text-stone-900">{cartItem.quantity}</span>
                        
                        <button
                            onClick={handleIncrease}
                            disabled={cartItem.quantity >= product.stock_quantity}
                            className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-stone-600 shadow-sm transition-all hover:bg-stone-50 active:scale-90 disabled:opacity-50"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleAddToCart}
                        disabled={outOfStock}
                        className="mt-auto flex w-full items-center justify-center space-x-2 rounded-lg bg-stone-900 py-3 text-sm font-bold text-white transition-all hover:bg-stone-800 active:scale-95 disabled:bg-stone-300 disabled:cursor-not-allowed"
                    >
                        <Plus size={16} />
                        <span>{outOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                )}
            </div>
        </div>
    );
}