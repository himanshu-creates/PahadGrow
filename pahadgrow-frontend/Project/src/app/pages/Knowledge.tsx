import { useState } from 'react';
import { Search, Play, BookOpen, Lock, Clock, Eye, Upload, Star, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { isLoggedIn } from '../../api';
import { useLanguage } from '../contexts/LanguageContext';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  author: string;
  authorRole: string;
  description: string;
  isPaid: boolean;
  price?: string;
  category: string;
  rating: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface Article {
  id: string;
  title: string;
  author: string;
  readTime: string;
  category: string;
  excerpt: string;
  isPaid: boolean;
}

const VIDEOS: Video[] = [
  { id: '1', title: 'Organic Farming Techniques for Himalayas', thumbnail: 'https://images.unsplash.com/photo-1759593641759-93551a10e9fc?w=400', duration: '12:34', views: '2.4K', author: 'Dr. Rajesh Kumar', authorRole: 'Agricultural Scientist', description: 'Learn sustainable organic farming methods perfect for Himalayan terrain and soil conditions.', isPaid: false, category: 'Organic Farming', rating: 4.8, level: 'Beginner' },
  { id: '2', title: 'Honey Bee Farming Complete Guide', thumbnail: 'https://images.unsplash.com/photo-1645549826194-1956802d83c2?w=400', duration: '18:45', views: '5.1K', author: 'Ramesh Negi', authorRole: 'Beekeeping Expert', description: 'Master the art of beekeeping, honey extraction and packaging for premium sales.', isPaid: true, price: '₹99', category: 'Honey & Bees', rating: 4.9, level: 'Intermediate' },
  { id: '3', title: 'Apple Cultivation in High Altitude', thumbnail: 'https://images.unsplash.com/photo-1587418756582-0c3b4fe798b2?w=400', duration: '15:20', views: '3.8K', author: 'Sunita Rawat', authorRole: 'Horticulture Expert', description: 'Complete guide to growing premium Himalayan apples with modern grafting techniques.', isPaid: false, category: 'Fruits', rating: 4.7, level: 'Intermediate' },
  { id: '4', title: 'Herbal Medicine Plant Growing', thumbnail: 'https://images.unsplash.com/photo-1698556735172-1b5b3cd9d2ce?w=400', duration: '22:15', views: '1.9K', author: 'Dr. Vijay Sharma', authorRole: 'Ayurvedic Botanist', description: 'Cultivate high-value medicinal herbs like Ashwagandha, Brahmi, and Giloy for profit.', isPaid: true, price: '₹149', category: 'Herbs', rating: 4.6, level: 'Advanced' },
  { id: '5', title: 'Goat Farming Business Startup', thumbnail: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400', duration: '20:30', views: '4.2K', author: 'Mohan Singh', authorRole: 'Livestock Farmer', description: 'Start a profitable goat farming business from scratch in the Himalayan region.', isPaid: false, category: 'Livestock', rating: 4.5, level: 'Beginner' },
  { id: '6', title: 'Organic Pest Control Methods', thumbnail: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400', duration: '14:20', views: '3.1K', author: 'Dr. Priya Negi', authorRole: 'Pest Control Specialist', description: 'Protect your crops using 100% natural and organic pest control solutions.', isPaid: false, category: 'Pest Control', rating: 4.4, level: 'Beginner' },
  { id: '7', title: 'Drip Irrigation Setup for Hill Farms', thumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400', duration: '25:00', views: '2.7K', author: 'Rajendra Bisht', authorRole: 'Irrigation Engineer', description: 'Set up efficient drip irrigation on steep hill terrain to save water and boost yields.', isPaid: true, price: '₹199', category: 'Irrigation', rating: 4.8, level: 'Intermediate' },
  { id: '8', title: 'Mushroom Farming for Beginners', thumbnail: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400', duration: '16:40', views: '6.3K', author: 'Kavita Joshi', authorRole: 'Mushroom Cultivator', description: 'Start a mushroom farming unit at home with minimal investment and high returns.', isPaid: false, category: 'Mushrooms', rating: 4.9, level: 'Beginner' },
];

const ARTICLES: Article[] = [
  { id: 'a1', title: 'Top 10 High-Value Crops for Uttarakhand', author: 'Dr. Rajesh Kumar', readTime: '5 min', category: 'Crops', excerpt: 'Discover which crops yield the highest profit per acre in Himalayan conditions...', isPaid: false },
  { id: 'a2', title: 'Government Subsidies for Hill Farmers 2024', author: 'Pooja Rawat', readTime: '8 min', category: 'Finance', excerpt: 'A complete guide to all government schemes and subsidies available for Uttarakhand farmers...', isPaid: false },
  { id: 'a3', title: 'Organic Certification Process in India', author: 'Sunita Rawat', readTime: '10 min', category: 'Organic Farming', excerpt: 'Step-by-step guide to get organic certification for your farm products...', isPaid: true },
];

const CATEGORIES = ['All', 'Organic Farming', 'Fruits', 'Honey & Bees', 'Herbs', 'Livestock', 'Pest Control', 'Irrigation', 'Mushrooms'];

const LEVEL_COLORS = { Beginner: 'bg-green-100 text-green-700', Intermediate: 'bg-blue-100 text-blue-700', Advanced: 'bg-purple-100 text-purple-700' };

export default function Knowledge() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'videos' | 'articles'>('videos');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const filteredVideos = VIDEOS.filter(v => {
    const matchCat = selectedCategory === 'All' || v.category === selectedCategory;
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.author.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredArticles = ARTICLES.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleWatch = (video: Video) => {
    if (video.isPaid && !isLoggedIn()) {
      showToast('Please login to access premium content');
      return;
    }
    setSelectedVideo(video);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={isLoggedIn()} userRole="buyer" />

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl"
          >
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 cursor-pointer hover:bg-white/30 transition-colors">
                  <Play size={36} className="ml-1" />
                </div>
                <p className="text-sm opacity-75">Demo preview — integrate YouTube/Vimeo URL for real video</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1">{selectedVideo.title}</h3>
                  <p className="text-muted-foreground text-sm">{selectedVideo.author} · {selectedVideo.authorRole}</p>
                </div>
                <button onClick={() => setSelectedVideo(null)} className="text-muted-foreground hover:text-foreground p-2">✕</button>
              </div>
              <p className="text-muted-foreground mt-3">{selectedVideo.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock size={14} />{selectedVideo.duration}</span>
                <span className="flex items-center gap-1"><Eye size={14} />{selectedVideo.views} views</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[selectedVideo.level]}`}>{selectedVideo.level}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('knowledge.title')}</h1>
          <p className="text-lg text-muted-foreground">Learn from experts and grow your farming business</p>
        </div>

        {/* Upload Banner */}
        <div className="bg-gradient-to-r from-primary to-green-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('knowledge.shareKnowledge')}</h2>
              <p className="opacity-90">Share your farming expertise and earn from your knowledge</p>
              <div className="flex gap-4 mt-3 text-sm opacity-80">
                <span>✅ Earn from paid content</span>
                <span>✅ Build your brand</span>
                <span>✅ Help fellow farmers</span>
              </div>
            </div>
            <button
              onClick={() => !isLoggedIn() && showToast('Please login to upload content')}
              className="flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-xl hover:bg-green-50 transition-colors font-semibold shadow-md whitespace-nowrap"
            >
              <Upload size={20} />
              {t('knowledge.uploadVideo')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['videos', 'articles'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all capitalize ${
                activeTab === tab ? 'bg-primary text-white shadow-sm' : 'bg-white border border-border text-muted-foreground hover:text-primary'
              }`}
            >
              {tab === 'videos' ? <Play size={16} /> : <BookOpen size={16} />}
              {tab === 'videos' ? t('knowledge.videoTutorials') : t('knowledge.articles')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder={t('knowledge.searchVideos')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Videos', value: String(VIDEOS.length), icon: '🎬' },
            { label: 'Free Videos', value: String(VIDEOS.filter(v => !v.isPaid).length), icon: '🆓' },
            { label: 'Expert Authors', value: '12+', icon: '👨‍🌾' },
            { label: 'Total Views', value: '50K+', icon: '👁️' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Videos Grid */}
        {activeTab === 'videos' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Search size={40} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No videos found. Try a different search.</p>
              </div>
            ) : filteredVideos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all group hover:-translate-y-1"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => handleWatch(video)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <Play size={24} className="text-primary ml-1" />
                    </div>
                  </button>
                  {video.isPaid && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      <Lock size={10} /> {video.price}
                    </div>
                  )}
                  {!video.isPaid && (
                    <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {t('knowledge.free')}
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-mono">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[video.level]}`}>{video.level}</span>
                    <span className="text-xs text-muted-foreground capitalize">{video.category}</span>
                  </div>
                  <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-[10px]">
                      {video.author[0]}
                    </div>
                    <span className="truncate">{video.author}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Eye size={11} />{video.views}</span>
                    <span className="flex items-center gap-1">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      {video.rating}
                    </span>
                  </div>
                  <button
                    onClick={() => handleWatch(video)}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      video.isPaid
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    {video.isPaid ? <><Lock size={13} /> Unlock {video.price}</> : <><Play size={13} /> {t('knowledge.watchNow')}</>}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Articles */}
        {activeTab === 'articles' && (
          <div className="space-y-4">
            {filteredArticles.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{article.category}</span>
                      {article.isPaid && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium flex items-center gap-1"><Lock size={9} /> Premium</span>}
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={11} />{article.readTime} read</span>
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{article.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{article.excerpt}</p>
                    <p className="text-xs text-muted-foreground mt-2">By {article.author}</p>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
