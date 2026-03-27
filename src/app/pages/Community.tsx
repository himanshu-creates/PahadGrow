import { MessageSquare, User, ThumbsUp, MessageCircle, Plus, Reply } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function Community() {
  const posts = [
    {
      id: '1',
      author: 'Ramesh Negi',
      avatar: 'https://images.unsplash.com/photo-1606203452426-f5af98e6f96e?w=200',
      time: '2 hours ago',
      question: 'What is the best time to harvest apples in Mukteshwar region?',
      content: 'I have recently started apple farming and want to know the optimal harvest time for maximum yield and quality. Any experienced farmers here who can guide me?',
      likes: 12,
      replies: 5,
      tags: ['Apples', 'Harvesting'],
    },
    {
      id: '2',
      author: 'Sunita Rawat',
      avatar: 'https://images.unsplash.com/photo-1606203452426-f5af98e6f96e?w=200',
      time: '5 hours ago',
      question: 'Organic pest control methods for herb cultivation',
      content: 'Looking for natural and organic ways to control pests in my herb garden. Chemical pesticides are affecting the quality. Please share your experiences.',
      likes: 24,
      replies: 8,
      tags: ['Herbs', 'Organic', 'Pest Control'],
    },
    {
      id: '3',
      author: 'Vijay Singh',
      avatar: 'https://images.unsplash.com/photo-1606203452426-f5af98e6f96e?w=200',
      time: '1 day ago',
      question: 'Government schemes for beekeeping in Uttarakhand?',
      content: 'I want to start a honey bee farming business. Does anyone know about current government subsidies or schemes available for beekeeping?',
      likes: 18,
      replies: 12,
      tags: ['Beekeeping', 'Government Schemes'],
    },
  ];

  const topContributors = [
    { name: 'Dr. Rajesh Kumar', points: 2450, avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200', specialty: 'Organic Farming Expert' },
    { name: 'Ramesh Negi', points: 1820, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', specialty: 'Apple Cultivation' },
    { name: 'Sunita Rawat', points: 1560, avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200', specialty: 'Herb Farming' },
  ];

  const trendingTopics = [
    { name: 'Organic Farming', posts: 156 },
    { name: 'Apples', posts: 142 },
    { name: 'Honey Production', posts: 98 },
    { name: 'Pest Control', posts: 87 },
    { name: 'Irrigation', posts: 76 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="buyer" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Community Forum</h1>
          <p className="text-lg text-muted-foreground">Connect, learn, and grow together with fellow farmers</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ask Question Input Box */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-border">
              <textarea
                placeholder="Ask farming question..."
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-foreground"
                rows={4}
              ></textarea>
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#374151] hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32] transition-all shadow-sm">
                    <MessageSquare size={18} />
                    Add Image
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#374151] hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32] transition-all shadow-sm">
                    <User size={18} />
                    Add Tag
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#374151] hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32] transition-all shadow-sm">
                    <Plus size={18} />
                    Add Location
                  </button>
                </div>
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-[#2E7D32] transition-colors shadow-sm font-medium">
                  Post Question
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl p-6 shadow-md border border-border hover:shadow-xl transition-all">
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={post.avatar} 
                    alt={post.author} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-border"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{post.author}</h4>
                    <p className="text-sm text-muted-foreground">{post.time}</p>
                  </div>
                </div>

                {/* Question Title */}
                <h3 className="text-xl font-bold text-foreground mb-3">{post.question}</h3>
                
                {/* Description */}
                <p className="text-muted-foreground mb-4 leading-relaxed">{post.content}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1.5 bg-tag-bg text-primary rounded-full text-sm font-medium border border-primary/20">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-border my-4"></div>

                {/* Actions */}
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <ThumbsUp size={20} />
                    <span className="font-medium">{post.likes} Likes</span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle size={20} />
                    <span className="font-medium">{post.replies} Replies</span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Reply size={20} />
                    <span className="font-medium">Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Top Contributors */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-border">
              <h3 className="font-bold text-xl text-foreground mb-5">Top Contributors</h3>
              <div className="space-y-4">
                {topContributors.map((user, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors cursor-pointer">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.specialty}</p>
                      <p className="text-xs text-primary font-medium mt-0.5">{user.points} points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-border">
              <h3 className="font-bold text-xl text-foreground mb-5">Trending Topics</h3>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors cursor-pointer">
                    <span className="font-medium text-foreground">#{topic.name}</span>
                    <span className="text-sm text-muted-foreground">{topic.posts} posts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
              <h3 className="font-bold text-xl text-foreground mb-4">Community Guidelines</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Be respectful and helpful to all members</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Share accurate and verified information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Stay on topic and relevant to farming</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>No spam, advertising, or self-promotion</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}