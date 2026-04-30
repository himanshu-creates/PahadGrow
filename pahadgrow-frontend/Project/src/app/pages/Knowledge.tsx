import { Search, Play, BookOpen, Users, TrendingUp, Clock, Eye } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function Knowledge() {
  const videos = [
    {
      id: '1',
      title: 'Organic Farming Techniques for Himalayas',
      thumbnail: 'https://images.unsplash.com/photo-1759593641759-93551a10e9fc?w=400',
      duration: '12:34',
      views: '2.4K',
      author: 'Dr. Rajesh Kumar',
      description: 'Learn sustainable organic farming methods perfect for Himalayan terrain',
      isPaid: false,
    },
    {
      id: '2',
      title: 'Honey Bee Farming Complete Guide',
      thumbnail: 'https://images.unsplash.com/photo-1645549826194-1956802d83c2?w=400',
      duration: '18:45',
      views: '5.1K',
      author: 'Ramesh Negi',
      description: 'Master the art of beekeeping and honey production',
      isPaid: true,
      price: '₹99',
    },
    {
      id: '3',
      title: 'Apple Cultivation in High Altitude',
      thumbnail: 'https://images.unsplash.com/photo-1587418756582-0c3b4fe798b2?w=400',
      duration: '15:20',
      views: '3.8K',
      author: 'Sunita Rawat',
      description: 'Complete guide to growing premium apples in mountains',
      isPaid: false,
    },
    {
      id: '4',
      title: 'Herbal Medicine Plant Growing',
      thumbnail: 'https://images.unsplash.com/photo-1698556735172-1b5b3cd9d2ce?w=400',
      duration: '22:15',
      views: '1.9K',
      author: 'Dr. Vijay Sharma',
      description: 'Cultivate valuable medicinal herbs for profit',
      isPaid: true,
      price: '₹149',
    },
    {
      id: '5',
      title: 'Goat Farming Business Startup',
      thumbnail: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400',
      duration: '20:30',
      views: '4.2K',
      author: 'Mohan Singh',
      description: 'Start and scale your goat farming business',
      isPaid: false,
    },
    {
      id: '6',
      title: 'Organic Pest Control Methods',
      thumbnail: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400',
      duration: '14:20',
      views: '3.1K',
      author: 'Dr. Priya Negi',
      description: 'Natural solutions to protect your crops',
      isPaid: false,
    },
  ];

  const categories = ['All', 'Organic Farming', 'Fruits', 'Honey & Bees', 'Goat Farming', 'Herbs', 'Pest Control'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="buyer" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Knowledge Center</h1>
          <p className="text-lg text-muted-foreground">Learn from experts and grow your farming business</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search knowledge..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm text-foreground"
            />
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl p-8 mb-8 shadow-lg">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-3">Share Your Knowledge</h2>
            <p className="mb-6 opacity-90">
              Become an educator and earn by sharing your expertise with thousands of farmers
            </p>
            <button className="px-6 py-3 bg-white text-primary rounded-lg hover:bg-white/90 transition-colors font-medium shadow-md">
              Upload Tutorial
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Categories</h3>
          <div className="flex gap-3 flex-wrap">
            {categories.map((category, index) => (
              <button 
                key={index}
                className={`px-6 py-3 rounded-lg font-medium shadow-sm transition-all ${
                  index === 0 
                    ? 'bg-primary text-white border border-primary hover:bg-[#2E7D32]' 
                    : 'bg-white text-[#374151] border border-[#D1D5DB] hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Videos Grid - 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-xl shadow-md border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
              {/* Thumbnail Image */}
              <div className="relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Play className="text-primary ml-1" size={32} fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1.5 font-medium">
                  <Clock size={14} />
                  {video.duration}
                </div>
                {video.isPaid && (
                  <div className="absolute top-3 left-3 bg-accent text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md">
                    {video.price}
                  </div>
                )}
              </div>
              
              {/* Card Content */}
              <div className="p-5">
                {/* Title */}
                <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 leading-snug">{video.title}</h3>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{video.description}</p>
                
                {/* Author */}
                <p className="text-sm font-medium text-foreground mb-3">{video.author}</p>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Eye size={16} />
                    {video.views} views
                  </span>
                  {!video.isPaid ? (
                    <span className="text-secondary font-bold text-sm">FREE</span>
                  ) : (
                    <button className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-[#2E7D32] transition-colors">
                      Watch
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Popular Topics Section */}
        <div className="mt-12 bg-white rounded-xl p-8 shadow-md border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Popular Topics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Organic Farming', 'Bee Keeping', 'Crop Management', 'Soil Health', 'Pest Control', 'Irrigation', 'Marketing', 'Government Schemes'].map((topic, index) => (
              <button key={index} className="px-5 py-3 bg-white border border-border rounded-lg hover:border-primary hover:text-primary hover:bg-primary/5 transition-all font-medium text-foreground">
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}