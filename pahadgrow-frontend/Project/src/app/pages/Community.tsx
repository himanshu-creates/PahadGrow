import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, ThumbsUp, MessageCircle, Plus, Loader2, Tag,
  X, Send, ChevronDown, ChevronUp, Search, Sprout,
  CloudSun, TrendingUp, Wheat, Wrench, Users, Flame, LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import {
  getCommunityPosts,
  createCommunityPost,
  likePost,
  isLoggedIn as checkLoggedIn,
  CommunityPost,
} from '../../api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reply {
  _id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface PostWithReplies extends CommunityPost {
  likedByMe?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const FILTER_TABS = [
  { id: 'all',       label: 'All',       icon: Users },
  { id: 'farming',   label: 'Farming',   icon: Sprout },
  { id: 'weather',   label: 'Weather',   icon: CloudSun },
  { id: 'market',    label: 'Market',    icon: TrendingUp },
  { id: 'seeds',     label: 'Seeds',     icon: Wheat },
  { id: 'equipment', label: 'Equipment', icon: Wrench },
] as const;

type FilterTab = typeof FILTER_TABS[number]['id'];

const TOP_CONTRIBUTORS = [
  { name: 'Dr. Rajesh Kumar', points: 2450, specialty: 'Organic Farming Expert' },
  { name: 'Ramesh Negi',      points: 1820, specialty: 'Apple Cultivation' },
  { name: 'Sunita Rawat',     points: 1560, specialty: 'Herb Farming' },
];

const TRENDING_TOPICS = [
  { name: 'Organic Farming', posts: 156 },
  { name: 'Apple Harvest',   posts: 142 },
  { name: 'Honey Bees',      posts: 98 },
  { name: 'Pest Control',    posts: 87 },
  { name: 'Irrigation',      posts: 76 },
];

const GUIDELINES = [
  'Be respectful and helpful to fellow farmers',
  'Share accurate information only',
  'Keep topics related to farming & agriculture',
  'No spam or self-promotion',
];

const AVATAR_COLORS = [
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
];

function avatarColor(name: string) {
  const idx = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [msg]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      className="fixed top-5 right-5 z-[999] flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium max-w-xs"
    >
      <span className="flex-1">{msg}</span>
      <button onClick={onClose} className="text-white/60 hover:text-white">
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────────

interface CreatePostModalProps {
  onClose: () => void;
  onCreated: (post: CommunityPost) => void;
}

function CreatePostModal({ onClose, onCreated }: CreatePostModalProps) {
  const [question, setQuestion] = useState('');
  const [content, setContent]   = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags]         = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags(prev => [...prev, t]);
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) { setError('Please write a question title.'); return; }
    if (!content.trim())  { setError('Please add some details.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await createCommunityPost(question.trim(), content.trim(), tags);
      onCreated(res.post);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to post. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center">
                <MessageSquare size={15} className="text-white" />
              </div>
              <h2 className="font-bold text-lg text-gray-900">Ask a Question</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <X size={14} /> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question Title *</label>
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="e.g. How to control aphids on apple trees?"
                maxLength={150}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600/30 focus:border-green-600 outline-none text-sm transition-all"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{question.length}/150</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Details *</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Describe your question in detail. Include location, crop type, symptoms, etc..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600/30 focus:border-green-600 outline-none resize-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Tags <span className="font-normal text-gray-400">(up to 5)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-medium">
                    #{tag}
                    <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="hover:text-red-500 transition-colors ml-0.5">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              {tags.length < 5 && (
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-green-600/30 focus-within:border-green-600 transition-all">
                    <Tag size={14} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="Type tag and press Enter"
                      className="flex-1 py-2.5 outline-none text-sm bg-transparent"
                    />
                  </div>
                  <button
                    onClick={addTag}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 pb-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {submitting ? 'Posting…' : 'Post Question'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Reply Section ────────────────────────────────────────────────────────────

interface ReplyPanelProps {
  postId: string;
  isLoggedIn: boolean;
  authorName: string;
  onReplyAdded: () => void;
  toast: (msg: string) => void;
}

function ReplyPanel({ postId, isLoggedIn, onReplyAdded, toast }: ReplyPanelProps) {
  const [replies, setReplies]       = useState<Reply[]>([]);
  const [loading, setLoading]       = useState(true);
  const [replyText, setReplyText]   = useState('');
  const [sending, setSending]       = useState(false);

  useEffect(() => {
    fetchReplies();
  }, [postId]);

  const fetchReplies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('pg_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${BASE_URL}/users/community/${postId}/replies`, { headers });
      const data = await res.json();
      setReplies(data.replies || []);
    } catch {
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    if (!isLoggedIn) { toast('Please login to reply'); return; }
    setSending(true);
    try {
      const token = localStorage.getItem('pg_token');
      const res = await fetch(`${BASE_URL}/users/community/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: replyText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setReplies(prev => [...prev, data.reply]);
      setReplyText('');
      onReplyAdded();
      toast('Reply posted! 💬');
    } catch (e: any) {
      toast(e.message || 'Could not post reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="border-t border-gray-100 pt-5 mt-2 space-y-4">
        {/* Replies list */}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-green-700" />
          </div>
        ) : replies.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-4">No replies yet. Be the first!</p>
        ) : (
          <div className="space-y-3">
            {replies.map((r, i) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex gap-3"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor(r.authorName)}`}>
                  {r.authorName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800">{r.authorName}</span>
                    <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{r.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Reply input */}
        {isLoggedIn ? (
          <div className="flex gap-2 items-end">
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              placeholder="Write a reply… (Enter to send)"
              rows={2}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600/30 focus:border-green-600 outline-none resize-none text-sm transition-all"
            />
            <button
              onClick={sendReply}
              disabled={sending || !replyText.trim()}
              className="px-4 py-3 bg-green-700 text-white rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50 shrink-0"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <LogIn size={16} className="text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">
              <a href="/login" className="font-semibold underline underline-offset-2 hover:text-amber-800">Login</a> to reply to this post.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: PostWithReplies;
  index: number;
  onLike: (id: string) => void;
  onReplyAdded: (id: string) => void;
  loggedIn: boolean;
  toast: (msg: string) => void;
}

function PostCard({ post, index, onLike, onReplyAdded, loggedIn, toast }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.3), type: 'spring', stiffness: 280, damping: 24 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="p-6">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0 ${avatarColor(post.authorName)}`}>
            {post.authorName?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{post.authorName}</p>
            <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {/* Question */}
        <h3
          className="text-lg font-bold text-gray-900 mb-2 leading-snug cursor-pointer hover:text-green-700 transition-colors"
          onClick={() => setExpanded(e => !e)}
        >
          {post.question}
        </h3>

        {/* Content preview / full */}
        <p className={`text-sm text-gray-600 leading-relaxed mb-4 ${expanded ? '' : 'line-clamp-2'}`}>
          {post.content}
        </p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-green-50 border border-green-100 text-green-700 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
          <button
            onClick={() => {
              if (!loggedIn) { toast('Please login to like this post'); return; }
              onLike(post.id);
            }}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-green-50 ${
              post.likedByMe ? 'text-green-700' : 'text-gray-500 hover:text-green-700'
            }`}
          >
            <ThumbsUp
              size={16}
              className={`transition-all ${post.likedByMe ? 'fill-green-700 text-green-700' : ''}`}
            />
            <span>{post.likes}</span>
          </button>

          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-green-700 transition-colors px-2 py-1 rounded-lg hover:bg-green-50"
          >
            <MessageCircle size={16} />
            <span>{post.replyCount}</span>
            <span className="text-xs">
              {post.replyCount === 1 ? 'Reply' : 'Replies'}
            </span>
          </button>

          <button
            onClick={() => setExpanded(e => !e)}
            className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-green-700 transition-colors"
          >
            {expanded ? <><ChevronUp size={14} /> Collapse</> : <><ChevronDown size={14} /> View replies</>}
          </button>
        </div>
      </div>

      {/* Replies panel */}
      <AnimatePresence>
        {expanded && (
          <div className="px-6 pb-6">
            <ReplyPanel
              postId={post.id}
              isLoggedIn={loggedIn}
              authorName={post.authorName}
              onReplyAdded={() => onReplyAdded(post.id)}
              toast={toast}
            />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Community Page ──────────────────────────────────────────────────────

export default function Community() {
  const { isLoggedIn, user } = useAuth();
  const loggedIn = isLoggedIn;

  const [posts, setPosts]           = useState<PostWithReplies[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<FilterTab>('all');
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [toast, setToastMsg]        = useState('');

  const showToast = (msg: string) => setToastMsg(msg);

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const tag = activeTab !== 'all' ? activeTab : undefined;
      const res = await getCommunityPosts(tag);
      // Load liked state from localStorage
      const likedSet = getLikedSet();
      setPosts((res.posts || []).map((p: CommunityPost) => ({
        ...p,
        likedByMe: likedSet.has(p.id),
      })));
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Persist liked posts in localStorage per user session
  const likedKey = () => `pg_liked_posts_${user?.id || 'anon'}`;
  const getLikedSet = () => {
    try { return new Set<string>(JSON.parse(localStorage.getItem(likedKey()) || '[]')); }
    catch { return new Set<string>(); }
  };
  const saveLiked = (set: Set<string>) => {
    localStorage.setItem(likedKey(), JSON.stringify([...set]));
  };

  const handleLike = async (postId: string) => {
    const liked = getLikedSet();
    try {
      const res = await likePost(postId);
      const wasLiked = liked.has(postId);
      if (wasLiked) liked.delete(postId); else liked.add(postId);
      saveLiked(liked);
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, likes: res.likes, likedByMe: !wasLiked }
            : p
        )
      );
    } catch {}
  };

  const handlePostCreated = (post: CommunityPost) => {
    setPosts(prev => [{ ...post, likedByMe: false }, ...prev]);
    showToast('Question posted successfully! 🌱');
  };

  const handleReplyAdded = (postId: string) => {
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, replyCount: p.replyCount + 1 } : p)
    );
  };

  // Filter by search
  const filtered = posts.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.question.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={checkLoggedIn()} userRole={user?.role ?? null} />

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast} onClose={() => setToastMsg('')} />}
      </AnimatePresence>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showModal && (
          <CreatePostModal
            onClose={() => setShowModal(false)}
            onCreated={handlePostCreated}
          />
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                  <Users size={15} className="text-white" />
                </div>
                <span className="text-green-200 text-sm font-medium uppercase tracking-wide">PahadGrow Community</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-2">
                Farmers Helping Farmers
              </h1>
              <p className="text-green-200 text-base max-w-lg">
                Ask questions, share knowledge, and grow together with farmers across the hills.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => {
                if (!loggedIn) { showToast('Please login to ask a question'); return; }
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-green-800 rounded-xl font-bold text-sm shadow-lg hover:bg-green-50 transition-colors shrink-0"
            >
              <Plus size={18} />
              Ask a Question
            </motion.button>
          </div>

          {/* Stats bar */}
          <div className="flex gap-8 mt-8 pt-8 border-t border-white/10">
            {[
              { label: 'Posts', value: posts.length },
              { label: 'Farmers', value: '2.4k+' },
              { label: 'Answers', value: posts.reduce((a, p) => a + p.replyCount, 0) },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold">{s.value}</p>
                <p className="text-green-300 text-xs uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Main Feed ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Search + Filter */}
            <div className="space-y-3">
              {/* Search */}
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-green-600/20 focus-within:border-green-600 transition-all">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search questions, topics, tags…"
                  className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {FILTER_TABS.map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                        active
                          ? 'bg-green-700 text-white border-green-700 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700'
                      }`}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Posts */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-green-700" size={36} />
                <p className="text-gray-400 text-sm">Loading community posts…</p>
              </div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm"
              >
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={28} className="text-green-700" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">
                  {search ? 'No results found' : 'No posts yet'}
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  {search
                    ? `No posts matching "${search}". Try a different search.`
                    : 'Be the first to ask a question in this category!'}
                </p>
                {!search && (
                  <button
                    onClick={() => {
                      if (!loggedIn) { showToast('Please login first'); return; }
                      setShowModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition-colors"
                  >
                    <Plus size={15} /> Ask First Question
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filtered.map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={i}
                    onLike={handleLike}
                    onReplyAdded={handleReplyAdded}
                    loggedIn={loggedIn}
                    toast={showToast}
                  />
                ))}
              </div>
            )}

            {/* Login CTA (not logged in) */}
            {!loggedIn && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-700 flex items-center justify-center shrink-0">
                  <LogIn size={22} className="text-white" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-bold text-gray-900 mb-1">Join the conversation</h4>
                  <p className="text-sm text-gray-500">Login to ask questions, like posts, and reply to fellow farmers.</p>
                </div>
                <a
                  href="/login"
                  className="px-5 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition-colors whitespace-nowrap"
                >
                  Login / Sign up
                </a>
              </motion.div>
            )}
          </div>

          {/* ── Sidebar ────────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Top Contributors */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Flame size={16} className="text-amber-500" />
                <h3 className="font-bold text-gray-900">Top Contributors</h3>
              </div>
              <div className="space-y-3">
                {TOP_CONTRIBUTORS.map((u, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${avatarColor(u.name)}`}>
                      {u.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.specialty}</p>
                    </div>
                    <span className="text-xs font-bold text-green-700 shrink-0">{u.points}pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-green-600" />
                <h3 className="font-bold text-gray-900">Trending Topics</h3>
              </div>
              <div className="space-y-1.5">
                {TRENDING_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => { setSearch(topic.name); setActiveTab('all'); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors group text-left"
                  >
                    <span className="font-medium text-sm text-gray-700 group-hover:text-green-700 transition-colors">
                      #{topic.name}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{topic.posts} posts</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
              <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <Sprout size={16} className="text-green-700" />
                Community Guidelines
              </h3>
              <ul className="space-y-2">
                {GUIDELINES.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                    <span className="text-green-600 font-bold mt-0.5 shrink-0">✓</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Ask (logged in) */}
            {loggedIn && (
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModal(true)}
                className="bg-green-700 rounded-2xl p-5 text-white cursor-pointer hover:bg-green-800 transition-colors shadow-md"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                    <MessageSquare size={15} className="text-white" />
                  </div>
                  <h3 className="font-bold">Ask a Question</h3>
                </div>
                <p className="text-sm text-green-200">
                  Share your farming challenges with the community and get expert advice.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Plus size={14} /> Post your question
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
