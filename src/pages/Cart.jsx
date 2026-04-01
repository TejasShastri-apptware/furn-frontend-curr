import { useDispatch } from 'react-redux';
import { useAppSelector } from '../store/hooks';
import { selectCartItems, selectCartLoading, selectCartTotal, selectCartCount, removeFromCart, updateQuantity } from '../store/slices/cartSlice';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';

export default function Cart() {
    const dispatch = useDispatch();
    const cart = useAppSelector(selectCartItems);
    const cartLoading = useAppSelector(selectCartLoading);
    const cartTotal = useAppSelector(selectCartTotal);
    const cartCount = useAppSelector(selectCartCount);

    if (cartLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 size={32} className="animate-spin text-stone-400" />
            </div>
        );
    }

    if (cartCount === 0) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-8 px-4 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-100 text-stone-300">
                    <img src='https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800' />
                </div>
                <div>
                    <h2 className="text-3xl font-serif font-black tracking-tighter text-stone-900">Your cart is empty</h2>
                    <p className="mt-4 text-stone-500">Looks like you haven't added any pieces yet.</p>
                </div>
                <Link
                    to="/store/products"
                    className="inline-flex items-center space-x-2 rounded-full bg-stone-900 px-10 py-4 text-sm font-bold text-white transition-all hover:bg-stone-800 active:scale-95"
                >
                    <span>Explore Collection</span>
                    <ArrowRight size={18} />
                </Link>
            </div>
        );
    }

    const shipping = cartTotal > 500 ? 0 : 45;
    const tax = cartTotal * 0.08;
    const orderTotal = cartTotal + shipping + tax;

    return (
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <h1 className="mb-12 text-4xl font-serif font-black tracking-tighter text-stone-900">Your Shopping Bag</h1>

            <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <div className="space-y-8">
                        {cart.map((item) => (
                            <div key={item.cart_item_id} className="group flex flex-col space-y-6 border-b border-stone-200 pb-8 sm:flex-row sm:space-x-8 sm:space-y-0">
                                <div className="h-48 w-full flex-shrink-0 overflow-hidden rounded-2xl bg-stone-100 sm:w-48">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-stone-300">
                                            <img src='https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800' />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col justify-between">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-serif font-bold text-stone-900">{item.name}</h3>
                                        </div>
                                        <p className="text-lg font-bold text-stone-900">₹{Number(item.price).toLocaleString('en-IN')}</p>
                                    </div>

                                    <div className="flex items-end justify-between pt-6">
                                        <div className="flex items-center space-x-4 rounded-full border border-stone-200 bg-white p-1">
                                            <button
                                                onClick={() => dispatch(updateQuantity({ cart_item_id: item.cart_item_id, quantity: item.quantity - 1 }))}
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-50 hover:text-stone-900 disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold text-stone-900">{item.quantity}</span>
                                            <button
                                                onClick={() => dispatch(updateQuantity({ cart_item_id: item.cart_item_id, quantity: item.quantity + 1 }))}
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-50 hover:text-stone-900"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <div className="text-right space-y-1">
                                            <p className="text-sm font-bold text-stone-900">
                                                Subtotal: ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                                            </p>
                                            <button
                                                onClick={() => dispatch(removeFromCart(item.cart_item_id))}
                                                className="flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-stone-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                <span>Remove</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="relative">
                    <div className="sticky top-32 rounded-3xl bg-stone-50 p-10">
                        <h2 className="mb-8 text-xl font-serif font-bold text-stone-900">Order Summary</h2>

                        <div className="space-y-6 border-b border-stone-200 pb-8 text-sm text-stone-500">
                            <div className="flex justify-between">
                                <span>Subtotal ({cartCount} items)</span>
                                <span className="font-bold text-stone-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Estimated Shipping</span>
                                <span className="font-bold text-stone-900">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Estimated Tax (8%)</span>
                                <span className="font-bold text-stone-900">₹{tax.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between pt-8">
                            <span className="text-lg font-bold text-stone-900">Total</span>
                            <div className="text-right">
                                <p className="text-2xl font-black text-stone-900">₹{orderTotal.toFixed(2)}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Including Tax</p>
                            </div>
                        </div>

                        <Link
                            to="/store/checkout"
                            className="mt-10 flex w-full items-center justify-center space-x-3 rounded-2xl bg-stone-900 py-5 font-bold text-white transition-all hover:bg-stone-800 active:scale-95"
                        >
                            <span>Proceed to Checkout</span>
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
