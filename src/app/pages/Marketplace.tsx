import { useState } from 'react';
import { Link } from 'react-router';
import { ShoppingCart, Heart, Search, Filter, Star } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Rating } from '../components/Rating';

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Fruits', 'Honey', 'Dairy', 'Herbs', 'Crops'];

  const products = [
    {
      id: '1',
      name: 'Pure Himalayan Honey',
      price: '₹450',
      image: 'https://images.unsplash.com/photo-1645549826194-1956802d83c2?w=400',
      seller: 'Ramesh Negi',
      location: 'Mukteshwar',
      rating: 4.8,
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
      category: 'dairy',
    },
    {
      id: '5',
      name: 'Wild Honey',
      price: '₹550',
      image: 'https://images.unsplash.com/photo-1645549826194-1956802d83c2?w=400',
      seller: 'Harish Negi',
      location: 'Munsiyari',
      rating: 4.6,
      category: 'honey',
    },
    {
      id: '6',
      name: 'Red Apples',
      price: '₹140/kg',
      image: 'https://images.unsplash.com/photo-1587418756582-0c3b4fe798b2?w=400',
      seller: 'Lata Pandey',
      location: 'Ranikhet',
      rating: 4.4,
      category: 'fruits',
    },
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory.toLowerCase());

  const searchedProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="buyer" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Marketplace</h1>
          <p className="text-lg text-muted-foreground">Discover authentic Himalayan products from local farmers</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md border border-border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search Uttarakhand villages, crops, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-lg shadow-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            
            {/* Filter Button */}
            <button className="px-6 py-3 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32] transition-all shadow-sm hover:shadow-md flex items-center gap-2">
              <Filter size={20} />
              <span>Filters</span>
            </button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3 mt-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category.toLowerCase())}
                className={`px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md ${
                  selectedCategory === category.toLowerCase()
                    ? 'bg-primary text-white border border-primary'
                    : 'bg-white text-[#374151] border border-[#D1D5DB] hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchedProducts.map((product) => (
            <Link 
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white rounded-xl shadow-md border border-border overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md">
                  <svg className="w-5 h-5 text-icon hover:text-destructive transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg text-foreground mb-2">{product.name}</h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <Rating rating={Math.round(product.rating)} size="sm" />
                  <span className="text-sm text-muted-foreground">({product.rating})</span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <Star size={14} />
                  <span>{product.location}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Seller</p>
                    <p className="font-medium text-foreground">{product.seller}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{product.price}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-[#2E7D32] transition-colors font-medium shadow-sm">
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}