import { Link, useNavigate } from 'react-router';
import { ArrowRight, ShoppingBag, BookOpen, MapPin, Users, Search, TrendingUp, Package, DollarSign, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import Slider from 'react-slick';
import { Navbar } from '../components/Navbar';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import logo from "../../assets/placeholder.png";

export default function Landing() {
  const { t } = useLanguage();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const handleStartSelling = () => {
    if (isLoggedIn) {
      if (user?.role === 'seller' || user?.role === 'landowner' || user?.role === 'admin') {
        navigate('/seller');
      } else {
        // Buyer hai — dashboard ke profile tab pe le jao jahan role upgrade ho sake
        navigate('/dashboard');
      }
    } else {
      navigate('/signup');
    }
  };
  const [heroText, setHeroText] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const heroTexts = [
    t('hero.title1'),
    t('hero.title2'),
    t('hero.title3'),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroText((prev) => (prev + 1) % heroTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [heroTexts.length]);

  const features = [
    {
      icon: <ShoppingBag size={28} />,
      title: t('features.marketplace'),
      description: t('features.marketplaceDesc'),
    },
    {
      icon: <BookOpen size={28} />,
      title: t('features.knowledge'),
      description: t('features.knowledgeDesc'),
    },
    {
      icon: <MapPin size={28} />,
      title: t('features.landRental'),
      description: t('features.landRentalDesc'),
    },
    {
      icon: <Users size={28} />,
      title: t('features.community'),
      description: t('features.communityDesc'),
    },
  ];

  const rareProducts = [
    {
      name: 'Kafal (Box Myrtle)',
      image: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=600',
      profit: '₹500-800/kg',
      location: 'Almora, Nainital',
      demand: 'Very High',
      description: 'Rare Himalayan berry with medicinal properties',
    },
    {
      name: 'Buransh (Rhododendron)',
      image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600',
      profit: '₹300-500/kg',
      location: 'Chamoli, Rudraprayag',
      demand: 'High',
      description: 'Traditional flower used in beverages and medicines',
    },
    {
      name: 'Mountain Honey',
      image: 'https://images.unsplash.com/photo-1448062885262-aa6670248b0e?w=600',
      profit: '₹600-1200/kg',
      location: 'All Districts',
      demand: 'Very High',
      description: 'Pure wild honey from Himalayan forests',
    },
    {
      name: 'Pahadi Goat Milk',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600',
      profit: '₹80-100/liter',
      location: 'Mountain Villages',
      demand: 'High',
      description: 'Organic goat milk with high nutritional value',
    },
  ];

  const successStories = [
    {
      name: 'Ramesh Negi',
      village: 'Mukteshwar',
      story: 'Increased monthly income by 300% selling organic apples through PahadGrow',
      image: 'https://images.unsplash.com/photo-1624734486332-74fa62123f22?w=400',
      earnings: '₹45,000/month',
    },
    {
      name: 'Sunita Rawat',
      village: 'Almora',
      story: 'Built successful honey business serving 100+ customers nationwide',
      image: 'https://images.unsplash.com/photo-1448062885262-aa6670248b0e?w=400',
      earnings: '₹35,000/month',
    },
    {
      name: 'Vijay Singh',
      village: 'Pithoragarh',
      story: 'Started herbal products company with PahadGrow connecting to urban markets',
      image: 'https://images.unsplash.com/photo-1622042914579-f5d10cf8ea4d?w=400',
      earnings: '₹60,000/month',
    },
    {
      name: 'Maya Bisht',
      village: 'Chamoli',
      story: 'Farmer from Chamoli earned ₹20,000 in first month selling Buransh juice',
      image: 'https://images.unsplash.com/photo-1622042914579-f5d10cf8ea4d?w=400',
      earnings: '₹20,000/month',
    },
  ];

  const districts = [
    { name: 'Almora', crops: 'Apricot, Apples, Walnuts', opportunities: 45 },
    { name: 'Chamoli', crops: 'Herbs, Buransh, Vegetables', opportunities: 38 },
    { name: 'Pithoragarh', crops: 'Medicinal Herbs, Grains', opportunities: 42 },
    { name: 'Bageshwar', crops: 'Kafal, Honey, Apples', opportunities: 35 },
    { name: 'Nainital', crops: 'Fruits, Vegetables, Flowers', opportunities: 52 },
    { name: 'Rudraprayag', crops: 'Herbs, Traditional Crops', opportunities: 30 },
  ];

  const stats = [
    { label: 'Villages Connected', value: 1250, suffix: '+', icon: <MapPin size={24} /> },
    { label: 'Farmers Joined', value: 5000, suffix: '+', icon: <Users size={24} /> },
    { label: 'Products Listed', value: 15000, suffix: '+', icon: <Package size={24} /> },
    { label: 'Income Generated', value: 2, suffix: ' Cr+', prefix: '₹', icon: <DollarSign size={24} /> },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const filters = [
    { id: 'all', label: 'All', icon: <Package size={16} /> },
    { id: 'fruits', label: 'Fruits', icon: <ShoppingBag size={16} /> },
    { id: 'honey', label: 'Honey', icon: <ShoppingBag size={16} /> },
    { id: 'land', label: 'Land', icon: <MapPin size={16} /> },
    { id: 'herbs', label: 'Herbs', icon: <BookOpen size={16} /> },
  ];

  const allContent = [
    // Fruits
    { id: 1, type: 'fruits', name: 'Organic Apples', category: 'Fruits', location: 'Almora', price: '₹120/kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', seller: 'Ramesh Negi', description: 'Premium quality organic apples from Mukteshwar' },
    { id: 2, type: 'fruits', name: 'Kafal (Box Myrtle)', category: 'Fruits', location: 'Nainital', price: '₹600/kg', image: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=400', seller: 'Sunita Bisht', description: 'Rare Himalayan berry with medicinal properties' },
    { id: 3, type: 'fruits', name: 'Plums', category: 'Fruits', location: 'Almora', price: '₹80/kg', image: 'https://images.unsplash.com/photo-1629828874514-a4c3e91c2c0e?w=400', seller: 'Vijay Singh', description: 'Fresh mountain plums' },
    { id: 4, type: 'fruits', name: 'Apricots', category: 'Fruits', location: 'Pithoragarh', price: '₹200/kg', image: 'https://images.unsplash.com/photo-1623074716186-fee2996dc8ee?w=400', seller: 'Maya Rawat', description: 'Sweet and juicy apricots' },
    
    // Honey
    { id: 5, type: 'honey', name: 'Mountain Honey', category: 'Honey', location: 'Chamoli', price: '₹800/kg', image: 'https://images.unsplash.com/photo-1448062885262-aa6670248b0e?w=400', seller: 'Dinesh Kumar', description: 'Pure wild honey from Himalayan forests' },
    { id: 6, type: 'honey', name: 'Buransh Honey', category: 'Honey', location: 'Rudraprayag', price: '₹1000/kg', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=400', seller: 'Rekha Bisht', description: 'Special honey from Rhododendron flowers' },
    { id: 7, type: 'honey', name: 'Organic Forest Honey', category: 'Honey', location: 'Almora', price: '₹700/kg', image: 'https://images.unsplash.com/photo-1516824711722-5fc8f361b7c7?w=400', seller: 'Harish Negi', description: 'Wild forest honey with natural flavor' },
    
    // Land
    { id: 8, type: 'land', name: '2 Acre Farmland', category: 'Land', location: 'Nainital', price: '₹5000/month', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400', seller: 'Prakash Singh', description: 'Fertile farmland with water facility' },
    { id: 9, type: 'land', name: '5 Acre Terraced Land', category: 'Land', location: 'Almora', price: '₹8000/month', image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400', seller: 'Suman Rawat', description: 'Perfect for organic farming' },
    { id: 10, type: 'land', name: '1 Acre Valley Land', category: 'Land', location: 'Chamoli', price: '₹4000/month', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400', seller: 'Mohan Bisht', description: 'Beautiful valley land with mountain view' },
    
    // Herbs
    { id: 11, type: 'herbs', name: 'Himalayan Herbs Mix', category: 'Herbs', location: 'Pithoragarh', price: '₹400/kg', image: 'https://images.unsplash.com/photo-1609156842543-f56a67b578e8?w=400', seller: 'Anita Negi', description: 'Medicinal herbs from high altitudes' },
    { id: 12, type: 'herbs', name: 'Buransh Flowers', category: 'Herbs', location: 'Rudraprayag', price: '₹350/kg', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400', seller: 'Krishna Kumar', description: 'Dried Rhododendron flowers for beverages' },
    { id: 13, type: 'herbs', name: 'Neem Leaves', category: 'Herbs', location: 'Almora', price: '₹150/kg', image: 'https://images.unsplash.com/photo-1622042914579-f5d10cf8ea4d?w=400', seller: 'Radha Singh', description: 'Organic neem leaves with medicinal value' },
  ];

  // Filter logic
  const filteredContent = allContent.filter((item) => {
    // Category filter
    const matchesCategory = selectedFilter === 'all' || item.type === selectedFilter;
    
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchLower) ||
      item.location.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
      item.seller.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower);
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Cinematic Video Hero Section */}
      <section className="relative overflow-hidden h-[90vh] flex items-center justify-center">
        {/* Video Background Placeholder - Using image for now */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10"></div>
          <img 
            src={isLoggedIn
              ? "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1920"
              : "https://images.unsplash.com/photo-1650120198224-5d00194be971?w=1920"}
            alt="Uttarakhand" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Subtle Logo Watermark */}
        <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none">
          <img 
            src={logo} 
            alt="" 
            className="w-[600px] h-auto opacity-[0.07] blur-[1px]"
          />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-20 text-center">
          <motion.div
            key={heroText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {heroTexts[heroText]}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-wrap gap-4 justify-center mt-8"
          >
            {!isLoggedIn && (
              <>
                <button
                  onClick={handleStartSelling}
                  className="group px-8 py-4 bg-primary text-white rounded-xl hover:bg-[#2E7D32] hover:shadow-2xl transition-all flex items-center gap-2 font-semibold hover:scale-105 shadow-lg"
                >
                  {t('hero.startSelling')}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  to="/marketplace"
                  className="px-8 py-4 bg-white/20 backdrop-blur-md text-white border-2 border-white/30 rounded-xl hover:bg-white/30 transition-all font-semibold hover:scale-105"
                >
                  {t('hero.explore')}
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Search by Place Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search Uttarakhand villages, crops, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-2xl shadow-md focus:border-primary focus:outline-none text-lg transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mt-6 justify-center">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md ${
                    selectedFilter === filter.id
                      ? 'bg-[#1B5E20] text-white border border-[#1B5E20]'
                      : 'bg-white text-[#374151] border border-[#D1D5DB] hover:bg-[#1B5E20] hover:text-white hover:border-[#1B5E20]'
                  }`}
                >
                  {filter.icon}
                  <span className="font-medium">{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filtered Results Section */}
      {(searchQuery || selectedFilter !== 'all') && (
        <section className="py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {filteredContent.length} Results Found
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery && `Searching for "${searchQuery}"`}
                  {searchQuery && selectedFilter !== 'all' && ' in '}
                  {selectedFilter !== 'all' && `${filters.find(f => f.id === selectedFilter)?.label}`}
                </p>
              </div>
              {(searchQuery || selectedFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFilter('all');
                  }}
                  className="px-4 py-2 text-sm bg-white border border-border rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {filteredContent.length > 0 ? (
              <motion.div 
                layout
                className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredContent.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-border transition-all group"
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-primary text-xs font-bold rounded-full border border-primary/20">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="text-lg font-bold text-[#111827] mb-2 group-hover:text-primary transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-sm text-[#4B5563] mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin size={14} />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users size={14} />
                          <span>{item.seller}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-xl font-bold text-primary">{item.price}</span>
                        <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-[#2E7D32] hover:shadow-lg transition-all">
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="bg-white rounded-2xl p-12 shadow-lg border border-border max-w-md mx-auto">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search size={40} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">No Results Found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any items matching your search criteria. Try adjusting your filters or search query.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFilter('all');
                    }}
                    className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-[#2E7D32] transition-all font-semibold"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Animated Stats Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Growing Impact</h2>
            <p className="text-xl text-muted-foreground">Real numbers, real transformation</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 text-center border border-border"
              >
                <div className="text-primary mb-4 flex justify-center">{stat.icon}</div>
                <div className="text-4xl font-bold text-foreground mb-2">
                  <AnimatedCounter 
                    end={stat.value} 
                    prefix={stat.prefix} 
                    suffix={stat.suffix} 
                  />
                </div>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rare Products Carousel */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">High-Profit Rare Products</h2>
            <p className="text-xl text-muted-foreground">Unique Himalayan crops with premium demand</p>
          </div>

          <Slider {...sliderSettings} className="rare-products-slider">
            {rareProducts.map((product, index) => (
              <div key={index} className="px-3">
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-border group"
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <p className="text-sm mb-1"><strong>Profit:</strong> {product.profit}</p>
                        <p className="text-sm mb-1"><strong>Location:</strong> {product.location}</p>
                        <p className="text-sm"><strong>Demand:</strong> {product.demand}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <p className="text-muted-foreground text-sm">{product.description}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="px-3 py-1 bg-secondary/20 text-secondary text-xs font-semibold rounded-full">
                        {product.demand} Demand
                      </span>
                      <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full">
                        {product.profit}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Migration Awareness Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1713164833944-7c1e13aaac55?w=800" 
                alt="Empty Village" 
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Stop The Migration. Build The Future.
              </h2>
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                Thousands of Uttarakhand villages are becoming empty due to migration. 
                Young people are leaving their ancestral lands for cities, abandoning 
                fertile fields and traditional livelihoods.
              </p>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                <strong className="text-primary">PahadGrow is changing this.</strong> We're creating 
                sustainable income opportunities, connecting villages to markets, and helping 
                families thrive in their own communities.
              </p>
              <Link 
                to="/marketplace" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-xl transition-all font-semibold hover:scale-105"
              >
                Explore Opportunities <ArrowRight size={20} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Uttarakhand Map Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Explore by District</h2>
            <p className="text-xl text-muted-foreground">Discover opportunities across Uttarakhand</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {districts.map((district, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="bg-card border-2 border-border hover:border-primary rounded-2xl p-6 text-left transition-all shadow-md hover:shadow-xl group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {district.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Click to explore</p>
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                    {district.opportunities}
                  </div>
                </div>
                <p className="text-muted-foreground mb-3">
                  <strong className="text-foreground">Main Crops:</strong> {district.crops}
                </p>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <TrendingUp size={16} />
                  <span className="font-medium">{district.opportunities} Active Opportunities</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Slider */}
      <section className="py-20 bg-gradient-to-br from-secondary/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Success Stories</h2>
            <p className="text-xl text-muted-foreground">Real people, real transformation</p>
          </div>

          <Slider {...sliderSettings}>
            {successStories.map((story, index) => (
              <div key={index} className="px-3">
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-border"
                >
                  <img src={story.image} alt={story.name} className="w-full h-56 object-cover" />
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-1">{story.name}</h3>
                    <p className="text-accent font-semibold mb-3 flex items-center gap-2">
                      <MapPin size={16} /> {story.village}
                    </p>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{story.story}</p>
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Earnings</span>
                        <span className="text-xl font-bold text-primary">{story.earnings}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose PahadGrow?</h2>
            <p className="text-xl text-muted-foreground">Complete ecosystem for rural prosperity</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-md hover:shadow-xl hover:border-primary transition-all duration-300 group"
              >
                <div className="text-[#1B5E20] mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#111827] group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-[#4B5563] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-secondary to-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Future?</h2>
            <p className="text-2xl mb-8 opacity-90">Join 5000+ farmers already earning with PahadGrow</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {!isLoggedIn && (
                <button
                  onClick={handleStartSelling}
                  className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-primary rounded-xl hover:bg-white/90 transition-all font-bold shadow-2xl hover:scale-105 text-lg"
                >
                  Get Started Today
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </button>
              )}
              <Link
                to="/subscription"
                className="inline-flex items-center gap-2 px-10 py-5 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl hover:bg-white/20 transition-all font-bold text-lg hover:scale-105"
              >
                View Plans
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}