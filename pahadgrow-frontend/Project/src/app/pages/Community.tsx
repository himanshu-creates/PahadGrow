import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, MessageCircle, Plus, Loader2, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { getCommunityPosts, createCommunityPost, likePost, isLoggedIn, CommunityPost } from '../../api';

export default function Community() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [question, setQuestion] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [toast, setToast] = useState('');

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await getCommunityPosts();
      setPosts(res.posts);
    } catch {}
    finally { setLoading(false); }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handlePost = async () => {
    if (!isLoggedIn()) { showToast('Please login to post'); return; }
    if (!question.trim() || !content.trim()) { showToast('Please fill in question and details'); return; }
    setSubmitting(true);
    try {
      const res = await createCommunityPost(question, content, tags);
      setPosts(prev => [res.post, ...prev]);
      setQuestion(''); setContent(''); setTags([]);
      showToast('Posted successfully! 🎉');
    } catch {
      showToast('Failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!isLoggedIn()) { showToast('Please login to like'); return; }
    try {
      const res = await likePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: res.likes } : p));
    } catch {}
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags(prev => [...prev, t]);
      setTagInput('');
    }
  };

  const topContributors = [
    { name: 'Dr. Rajesh Kumar', points: 2450, specialty: 'Organic Farming Expert' },
    { name: 'Ramesh Negi', points: 1820, specialty: 'Apple Cultivation' },
    { name: 'Sunita Rawat', points: 1560, specialty: 'Herb Farming' },
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
      <Navbar isLoggedIn={isLoggedIn()} userRole="buyer" />

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Community Forum</h1>
          <p className="text-lg text-muted-foreground">Connect, learn, and grow together with fellow farmers</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Box */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-border">
              <h3 className="font-semibold text-lg mb-4">Ask a Question</h3>
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Your question title..."
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-3"
              />
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Describe your question in detail..."
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none mb-3"
                rows={3}
              />
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    #{tag}
                    <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="text-primary/60 hover:text-red-500 ml-1">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mb-4">
                <div className="flex-1 flex items-center gap-2 border border-border rounded-lg px-3">
                  <Tag size={16} className="text-muted-foreground" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag (press Enter)"
                    className="flex-1 py-2 outline-none text-sm"
                  />
                </div>
                <button onClick={addTag} className="px-3 py-2 border border-border rounded-lg hover:bg-muted text-sm">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handlePost}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors font-medium disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                  Post Question
                </button>
              </div>
            </div>

            {/* Posts */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary" size={36} />
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-md border border-border">
                <MessageCircle size={40} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No posts yet. Be the first to ask!</p>
              </div>
            ) : (
              posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl p-6 shadow-md border border-border hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                      {post.authorName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold">{post.authorName}</h4>
                      <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2">{post.question}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{post.content}</p>

                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-border pt-4 flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                      <ThumbsUp size={18} />
                      <span>{post.likes} Likes</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium">
                      <MessageCircle size={18} />
                      <span>{post.replyCount} Replies</span>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-border">
              <h3 className="font-bold text-lg mb-4">Top Contributors</h3>
              <div className="space-y-3">
                {topContributors.map((user, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                      {user.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{user.name}</h4>
                      <p className="text-xs text-muted-foreground">{user.specialty}</p>
                      <p className="text-xs text-primary font-medium">{user.points} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-border">
              <h3 className="font-bold text-lg mb-4">Trending Topics</h3>
              <div className="space-y-2">
                {trendingTopics.map((topic, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <span className="font-medium text-sm">#{topic.name}</span>
                    <span className="text-xs text-muted-foreground">{topic.posts} posts</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
              <h3 className="font-bold text-lg mb-4">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {['Be respectful and helpful', 'Share accurate information', 'Stay on farming topics', 'No spam or self-promotion'].map((g, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">✓</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
