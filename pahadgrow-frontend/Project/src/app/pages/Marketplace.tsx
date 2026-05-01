import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ShoppingCart, Heart, Search, SlidersHorizontal, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Rating } from '../components/Rating';
import { getProducts, addToCart, toggleWishlist, isLoggedIn, Product } from '../../api';

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'honey', label: 'Honey' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'herbs', label: 'Herbs' },
    { id: 'crops', label: 'Crops' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined,
      });
      setProducts(res.products);
    } catch {
      // fallback to empty
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn()) { showToast('Please login to add to cart'); return; }
    setCartLoading(productId);
    try {
      await addToCart(productId, 1);
      showToast('Added to cart! 🛒');
    } catch {
      showToast('Failed to add to cart');
    } finally {
      setCartLoading(null);
    }
  };

  const handleWishlist = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn()) { showToast('Please login to save items'); return; }
    try {
      const res = await toggleWishlist(productId);
      setWishlist(prev =>
        res.wishlisted ? [...prev, productId] : prev.filter(id => id !== productId)
      );
      showToast(res.wishlisted ? 'Added to wishlist ❤️' : 'Removed from wishlist');
    } catch {
      showToast('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={isLoggedIn()} userRole="buyer" />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-bounce">
          {toast}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Marketplace</h1>
          <p className="text-lg text-muted-foreground">Discover authentic Himalayan products from local farmers</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md border border-border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search products, villages, crops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
            <button className="px-6 py-3 bg-white border border-border rounded-lg text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center gap-2 font-medium">
              <SlidersHorizontal size={18} />
              <span>Filters</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white border border-primary shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-primary hover:text-white hover:border-primary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : products.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-5 font-medium">
              Showing <span className="text-foreground font-semibold">{products.length}</span> products
            </p>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/product/${product.id}`}
                    className="group bg-white rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-full block"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400'}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => handleWishlist(product.id, e)}
                        className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Heart
                          size={16}
                          className={wishlist.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                        />
                      </button>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-primary text-xs font-semibold rounded-full capitalize">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-base text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Rating rating={Math.round(product.rating)} size="sm" />
                        <span className="text-xs text-muted-foreground">({product.rating}) · {product.reviewCount} reviews</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <MapPin size={12} />
                        <span>{product.location}</span>
                        <span className="mx-1">·</span>
                        <span>{product.sellerName}</span>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                        <div>
                          <span className="text-xl font-bold text-primary">₹{product.price}</span>
                          <span className="text-xs text-muted-foreground ml-1">/{product.unit}</span>
                        </div>
                        <button
                          onClick={(e) => handleAddToCart(product.id, e)}
                          disabled={cartLoading === product.id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-green-800 transition-colors disabled:opacity-60"
                        >
                          {cartLoading === product.id ? <Loader2 size={12} className="animate-spin" /> : <ShoppingCart size={14} />}
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-border max-w-md mx-auto">
              <Search size={40} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No Products Found</h3>
              <p className="text-muted-foreground mb-5">Try adjusting your search or category filter.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
