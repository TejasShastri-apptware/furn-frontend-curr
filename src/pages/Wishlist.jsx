import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectWishlistItems } from '../store/slices/wishlistSlice';
import ProductCard from '../components/products/ProductCard';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function Wishlist() {
    const items = useAppSelector(selectWishlistItems);

    return (
        <div className="min-h-screen bg-stone-50/50 pb-20 pt-32">
            <div className="mx-auto max-w-[95%] px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-stone-400">
                            <Link to="/store" className="flex items-center gap-1 text-sm font-medium hover:text-stone-900 transition-colors">
                                <ArrowLeft size={14} />
                                Back to Shop
                            </Link>
                        </div>
                        <h1 className="text-4xl font-serif font-black tracking-tight text-stone-900 sm:text-5xl">
                            My Wishlist
                        </h1>
                        <p className="mt-2 text-stone-500 font-medium tracking-wide uppercase text-[10px]">
                            {items.length} {items.length === 1 ? 'item' : 'items'} saved
                        </p>
                    </div>
                </div>

                {items.length > 0 ? (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((item) => (
                            <ProductCard 
                                key={item.wishlist_id} 
                                product={{
                                    product_id: item.product_id,
                                    name: item.name,
                                    price: item.price,
                                    image_url: item.image_url,
                                    // Categories info might be missing here if the JOIN didn't have it, 
                                    // but ProductCard handles missing category gracefully.
                                    category_name: 'Saved'
                                }} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-stone-100 text-stone-300">
                            <Heart size={40} />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-stone-800">Your wishlist is empty</h2>
                        <p className="mt-3 max-w-xs text-stone-500">
                            Save items you love to your wishlist and they'll appear here.
                        </p>
                        <Link 
                            to="/store/products"
                            className="mt-10 flex items-center gap-2 rounded-full bg-stone-900 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-stone-800 hover:-translate-y-1 active:translate-y-0"
                        >
                            <ShoppingBag size={18} />
                            Start Exploring
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
