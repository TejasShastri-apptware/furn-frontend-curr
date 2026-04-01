import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../store/hooks';
import { selectCartItems, selectCartTotal, selectCartCount, clearCart } from '../store/slices/cartSlice';
import { selectUser } from '../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { orderApi } from '../api/orderApi';
import { ChevronLeft, ArrowRight, CheckCircle, MapPin, Loader2, AlertCircle } from 'lucide-react';

export default function Checkout() {
    const dispatch = useDispatch();
    const cart = useAppSelector(selectCartItems);
    const cartTotal = useAppSelector(selectCartTotal);
    const cartCount = useAppSelector(selectCartCount);
    const user = useAppSelector(selectUser);
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [addrLoading, setAddrLoading] = useState(true);
    const [addrError, setAddrError] = useState('');

    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [placedOrderId, setPlacedOrderId] = useState(null);

    // Load saved addresses
    useEffect(() => {
        if (!user?.user_id) {
            setAddrError('User session not found. Please sign in again.');
            setAddrLoading(false);
            return;
        }
        authApi.addresses.getByUser(user.user_id)
            .then(data => {
                setAddresses(data);
                // Pre-select default address if one exists
                const def = data.find(a => a.is_default);
                if (def) setSelectedAddressId(def.address_id);
                else if (data.length > 0) setSelectedAddressId(data[0].address_id);
            })
            .catch(e => setAddrError(e.message))
            .finally(() => setAddrLoading(false));
    }, [user?.user_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAddressId) {
            setSubmitError('Please select a shipping address.');
            return;
        }
        setIsSubmitting(true);
        setSubmitError('');
        try {
            const result = await orderApi.placeOrder({ shipping_address_id: selectedAddressId });
            setPlacedOrderId(result.order_id);
            await dispatch(clearCart());
            setIsSuccess(true);
        } catch (e) {
            setSubmitError(e.message || 'Order placement failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success screen
    if (isSuccess) {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-8 px-4 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle size={64} />
                </div>
                <div>
                    <h2 className="text-4xl font-serif font-black tracking-tighter text-stone-900">Order Placed!</h2>
                    {placedOrderId && (
                        <p className="mt-2 text-stone-400 text-sm font-mono">Order #{placedOrderId}</p>
                    )}
                    <p className="mt-4 text-stone-500">
                        Your order is <span className="font-semibold text-amber-600">pending approval</span> from our team.
                        You'll be able to track it in your order history.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/store/orders"
                        className="inline-flex items-center space-x-2 rounded-full bg-stone-900 px-10 py-4 text-sm font-bold text-white transition-all hover:bg-stone-800 active:scale-95"
                    >
                        <span>View My Orders</span>
                        <ArrowRight size={18} />
                    </Link>
                    <Link
                        to="/store"
                        className="inline-flex items-center space-x-2 rounded-full border border-stone-300 px-10 py-4 text-sm font-bold text-stone-700 transition-all hover:bg-stone-50 active:scale-95"
                    >
                        <span>Return Home</span>
                    </Link>
                </div>
            </div>
        );
    }

    // Empty cart guard
    if (cartCount === 0) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-serif text-stone-900">Your bag is empty</h2>
                <Link to="/store/products" className="mt-4 text-stone-500 underline underline-offset-4">Return to collection</Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <Link to="/store/cart" className="mb-12 inline-flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-stone-400 transition-colors hover:text-stone-900">
                <ChevronLeft size={16} />
                <span>Back to bag</span>
            </Link>

            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
                {/* Address selection */}
                <div>
                    <h1 className="mb-10 text-4xl font-serif font-black tracking-tighter text-stone-900">Shipping Details</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {addrLoading ? (
                            <div className="flex items-center gap-3 text-stone-400">
                                <Loader2 size={18} className="animate-spin" />
                                <span className="text-sm">Loading your addresses…</span>
                            </div>
                        ) : addrError ? (
                            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                <AlertCircle size={16} />
                                <span>{addrError}</span>
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="rounded-2xl border-2 border-dashed border-stone-200 p-8 text-center">
                                <MapPin size={32} className="mx-auto mb-3 text-stone-300" />
                                <p className="font-semibold text-stone-700">No saved addresses found.</p>
                                <p className="text-sm text-stone-500 mt-1">Please add an address to your account before placing an order.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500">Select a Shipping Address</h2>
                                {addresses.map(addr => (
                                    <label
                                        key={addr.address_id}
                                        className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all ${selectedAddressId === addr.address_id
                                            ? 'border-stone-900 bg-stone-50'
                                            : 'border-stone-200 hover:border-stone-400'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="address"
                                            value={addr.address_id}
                                            checked={selectedAddressId === addr.address_id}
                                            onChange={() => setSelectedAddressId(addr.address_id)}
                                            className="mt-1 accent-stone-900"
                                        />
                                        <div>
                                            <p className="font-bold text-stone-900 text-sm">{addr.address_line1}</p>
                                            {addr.address_line2 && <p className="text-sm text-stone-500">{addr.address_line2}</p>}
                                            <p className="text-sm text-stone-600">{addr.city}, {addr.state} {addr.postal_code}</p>
                                            <p className="text-sm text-stone-500">{addr.country}</p>
                                            {addr.is_default && (
                                                <span className="mt-2 inline-block rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">Default</span>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Error message */}
                        {submitError && (
                            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                <AlertCircle size={16} />
                                <span>{submitError}</span>
                            </div>
                        )}

                        <button
                            disabled={isSubmitting || addresses.length === 0 || !selectedAddressId}
                            type="submit"
                            className="flex w-full items-center justify-center space-x-3 rounded-2xl bg-stone-900 py-6 text-lg font-bold text-white transition-all hover:bg-stone-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                                <>
                                    <span>Place Order</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="rounded-3xl bg-stone-50 p-10 lg:sticky lg:top-32">
                        <h2 className="mb-8 text-xl font-serif font-bold text-stone-900">Order Summary</h2>
                        <div className="space-y-4 text-sm text-stone-500 border-b border-stone-200 pb-6">
                            {cart.map(item => (
                                <div key={item.cart_item_id} className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-stone-800 truncate">{item.name}</p>
                                        <p className="text-xs">Qty: {item.quantity}</p>
                                    </div>
                                    <span className="font-bold text-stone-900 shrink-0">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4 pt-6 text-sm text-stone-500">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-bold text-stone-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                        <div className="flex justify-between pt-6 border-t border-stone-200 mt-6">
                            <span className="text-lg font-bold text-stone-900">Total</span>
                            <span className="text-3xl font-black text-stone-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                        </div>
                        <p className="mt-3 text-xs text-stone-400 text-center">Order will be pending admin approval before processing.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
