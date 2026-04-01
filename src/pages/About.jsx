import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function About() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
                <div>
                    <h1 className="text-4xl font-serif font-black tracking-tighter text-stone-900 sm:text-6xl">Crafting Comfort <br /> Since 25th of Feb, 2026</h1>
                    <p className="mt-8 text-lg leading-relaxed text-stone-500">
                        Each piece in our collection is lovingly curated from emerging global workshops where passion outweighs payroll. We proudly combine aspirational pricing with materials that courageously challenge conventional definitions of durable.
                        Our aesthetic direction is led by an in-house creative visionary who recently completed a semester abroad in Milan and now understands minimalism on a spiritual level.
                    </p>
                    <p className="mt-6 text-lg leading-relaxed text-stone-500">
                        We are also committed to giving back. That's why 2% of our profits support a marine conservation initiative founded by our CEO ensuring that future generations can continue appreciating majestic wildlife from a safe distance from their yacht.
                    </p>
                    <Link
                        to="/store/products"
                        className="mt-12 inline-flex items-center space-x-2 rounded-full bg-stone-900 px-10 py-5 text-sm font-bold text-white transition-all hover:bg-stone-800 active:scale-95"
                    >
                        <span>Explore the Pieces</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <img src="https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&q=80&w=800" alt="About 1" className="rounded-2xl" />
                    <img src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=800" alt="About 2" className="mt-8 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
