import { useState } from 'react';
import { Link } from 'react-router';
import { ShoppingCart, Heart, Search, Filter, Star, MapPin, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Rating } from '../components/Rating';

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'honey', label: 'Honey' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'herbs', label: 'Herbs' },
    { id: 'crops', label: 'Crops' },
  ];

  const products = [
    {
      id: '1',
      name: 'Pure Himalayan Honey',
      price: '₹450',
      image: 'https://images.unsplash.com/photo-1645549826194-1956802d83c2?w=400',
      seller: 'Ramesh Negi',
      location: 'Mukteshwar',
      rating: 4.8,
      reviews: 124,
      category: 'honey',
    },
    {
      id: '2',
      name: 'Organic Apples',
      price: '₹120/kg',
      image: 'https://images.unsplash.com/photo-1587418756582-0c3b4fe798b2?w=400',
      seller: 'Sunita Rawat',
      location: 'Almora',
      rating: 4.5,
      reviews: 89,
      category: 'fruits',
    },
    {
      id: '3',
      name: 'Turmeric Powder',
      price: '₹200/100g',
      image: 'https://images.unsplash.com/photo-1698556735172-1b5b3cd9d2ce?w=400',
      seller: 'Vijay Singh',
      location: 'Pithoragarh',
      rating: 4.7,
      reviews: 67,
      category: 'herbs',
    },
    {
      id: '4',
      name: 'Fresh Dairy Milk',
      price: '₹60/L',
      image: 'https://images.unsplash.com/photo-1635714293982-65445548ac42?w=400',
      seller: 'Meera Bisht',
      location: 'Nainital',
      rating: 4.9,
      reviews: 203,
      category: 'dairy',
    },
    {
      id: '5',
      name: 'Wild Forest Honey',
      price: '₹550',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=400',
      seller: 'Harish Negi',
      location: 'Munsiyari',
      rating: 4.6,
      reviews: 55,
      category: 'honey',
    },
    {
      id: '6',
      name: 'Red Apples',
      price: '₹140/kg',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
      seller: 'Lata Pandey',
      location: 'Ranikhet',
      rating: 4.4,
      reviews: 41,
      category: 'fruits',
    },
    {
      id: '7',
      name: 'Himalayan Black Rice',
      price: '₹320/kg',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      seller: 'Deepak Rawat',
      location: 'Chamoli',
      rating: 4.8,
      reviews: 33,
      category: 'crops',
    },
    {
      id: '8',
      name: 'Buransh Juice Concentrate',
      price: '₹280/500ml',
      image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
      seller: 'Rekha Bisht',
      location: 'Rudraprayag',
      rating: 4.7,
      reviews: 78,
      category: 'herbs',
    },
  ];

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="buyer" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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

          {/* Categories */}
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

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-5 font-medium">
          Showing <span className="text-foreground font-semibold">{filtered.length}</span> products
        </p>

        {/* Products Grid */}
        {filtered.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
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
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => toggleWishlist(product.id, e)}
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
                      <span className="text-xs text-muted-foreground">({product.rating}) · {product.reviews} reviews</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin size={12} />
                      <span>{product.location}</span>
                      <span className="mx-1">·</span>
                      <span>{product.seller}</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                      <span className="text-xl font-bold text-primary">{product.price}</span>
                      <button
                        onClick={(e) => { e.preventDefault(); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-green-800 transition-colors"
                      >
                        <ShoppingCart size={14} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
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
