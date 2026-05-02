import { useState, useRef, useEffect } from 'react';
import {
  Search, Play, Lock, Clock, Eye, Upload, Star,
  Heart, MessageCircle, Send, X, AlertCircle, Loader2,
  VideoIcon, ImagePlus, ThumbsUp, CheckCircle,
  IndianRupee, Shield, Film,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { isLoggedIn, getCurrentUser } from '../../api';
import { useLanguage } from '../contexts/LanguageContext';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── API helpers ──────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem('pg_token'); }
function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
async function apiGet(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() });
  return res.json();
}
async function apiPost(path: string, body: object) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  return res.json();
}
async function uploadFile(
  endpoint: string,
  field: string,
  file: File,
  onProgress?: (p: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append(field, file);
    xhr.open('POST', `${BASE_URL}${endpoint}`);
    const t = getToken();
    if (t) xhr.setRequestHeader('Authorization', `Bearer ${t}`);
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.success) resolve(data.url);
        else reject(new Error(data.message || 'Upload failed'));
      } catch { reject(new Error('Upload failed')); }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface KnowledgeVideo {
  _id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  videoUrl: string | null;
  thumbnailUrl: string;
  duration: string;
  isPaid: boolean;
  price: number;
  views: number;
  likeCount: number;
  hasAccess?: boolean;
  createdAt: string;
}
interface Comment {
  _id: string;
  authorName: string;
  text: string;
  likeCount: number;
  createdAt: string;
}

const CATEGORIES = ['All','Organic Farming','Fruits','Honey & Bees','Herbs','Livestock','Pest Control','Irrigation','Mushrooms','Other'];
const LEVEL_COLORS = {
  Beginner:     'bg-green-100 text-green-700',
  Intermediate: 'bg-blue-100 text-blue-700',
  Advanced:     'bg-purple-100 text-purple-700',
};

// ─── UploadModal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile]         = useState<File | null>(null);
  const [thumbFile, setThumbFile]         = useState<File | null>(null);
  const [thumbPreview, setThumbPreview]   = useState('');
  const [videoProgress, setVideoProgress] = useState(0);
  const [uploading, setUploading]         = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', level: 'Beginner',
    authorRole: '', isPaid: false, price: '',
  });
  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 200 * 1024 * 1024) { setError('Video must be under 200MB'); return; }
    if (!f.type.startsWith('video/')) { setError('Please select a video file (MP4, MOV, WEBM)'); return; }
    setError(''); setVideoFile(f);
  };

  const handleThumbSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError('Thumbnail must be under 5MB'); return; }
    setError(''); setThumbFile(f);
    const reader = new FileReader();
    reader.onload = ev => setThumbPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!form.title.trim())   { setError('Title is required'); return; }
    if (!form.category)       { setError('Category is required'); return; }
    if (!videoFile)           { setError('Please select a video file'); return; }
    if (form.isPaid && (!form.price || Number(form.price) <= 0)) {
      setError('Enter a valid price for paid video'); return;
    }
    setError(''); setUploading(true);
    try {
      let thumbnailUrl = '';
      if (thumbFile) {
        thumbnailUrl = await uploadFile('/upload/thumbnail', 'thumbnail', thumbFile);
      }
      const videoUrl = await uploadFile('/upload/video', 'video', videoFile, p => setVideoProgress(p));
      const data = await apiPost('/knowledge', {
        title: form.title.trim(), description: form.description.trim(),
        category: form.category, level: form.level,
        authorRole: form.authorRole.trim() || 'Farmer',
        videoUrl, thumbnailUrl,
        isPaid: form.isPaid,
        price: form.isPaid ? Number(form.price) : 0,
      });
      if (!data.success) throw new Error(data.message || 'Failed to publish');
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold">Upload Knowledge Video</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Share your farming expertise with the community</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={44} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-1">Video Published!</h3>
            <p className="text-muted-foreground text-sm">Your video is now live on the Knowledge page.</p>
          </div>
        ) : (
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {/* VIDEO FILE */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Video File <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">(MP4, MOV, WEBM — max 200MB)</span>
              </label>
              {videoFile ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Film size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{videoFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                  <button type="button" onClick={() => { setVideoFile(null); setVideoProgress(0); }}
                    className="p-1.5 hover:bg-green-100 rounded-lg transition-colors text-gray-500">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleVideoSelect({ target: { files: e.dataTransfer.files } } as any); }}
                  onDragOver={e => e.preventDefault()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <VideoIcon size={26} className="text-primary" />
                  </div>
                  <p className="font-medium text-gray-700 mb-1">Click or drag video here</p>
                  <p className="text-sm text-gray-400">MP4, MOV, WEBM — max 200MB</p>
                </div>
              )}
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
              {uploading && videoProgress > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Uploading video...</span><span>{videoProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${videoProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* THUMBNAIL */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Thumbnail Image
                <span className="text-gray-400 font-normal ml-1">(optional, max 5MB)</span>
              </label>
              {thumbPreview ? (
                <div className="relative group w-full aspect-video rounded-xl overflow-hidden border border-gray-200">
                  <img src={thumbPreview} alt="thumbnail" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setThumbFile(null); setThumbPreview(''); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  ><X size={14} /></button>
                </div>
              ) : (
                <div
                  onClick={() => thumbInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <ImagePlus size={24} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Add a thumbnail for your video</p>
                </div>
              )}
              <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbSelect} />
            </div>

            {/* TITLE */}
            <div>
              <label className="block text-sm font-semibold mb-2">Video Title <span className="text-red-500">*</span></label>
              <input
                type="text" value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g., Organic Farming Techniques for Himalayas"
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="What will viewers learn from this video?"
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
              />
            </div>

            {/* CATEGORY + LEVEL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Category <span className="text-red-500">*</span></label>
                <select value={form.category} onChange={e => set('category', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none">
                  <option value="">Select category</option>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Level</label>
                <select value={form.level} onChange={e => set('level', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* AUTHOR ROLE */}
            <div>
              <label className="block text-sm font-semibold mb-2">Your Role / Expertise</label>
              <input
                type="text" value={form.authorRole} onChange={e => set('authorRole', e.target.value)}
                placeholder="e.g., Organic Farmer, Beekeeping Expert"
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* PAID TOGGLE */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm">Paid Content</p>
                  <p className="text-xs text-muted-foreground">Charge viewers to watch this video</p>
                </div>
                <button
                  type="button"
                  onClick={() => set('isPaid', !form.isPaid)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isPaid ? 'bg-amber-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPaid ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {form.isPaid && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-2 border border-amber-300 rounded-lg bg-white flex-1">
                    <IndianRupee size={15} className="text-amber-600" />
                    <input
                      type="number" value={form.price} onChange={e => set('price', e.target.value)}
                      placeholder="99" min="1"
                      className="flex-1 outline-none text-sm font-semibold"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-100 px-3 py-2 rounded-lg">
                    <Shield size={12} /> Viewers pay to unlock
                  </div>
                </div>
              )}
            </div>

            {/* SUBMIT */}
            <div className="flex gap-3 pt-1">
              <button
                type="button" onClick={handleSubmit} disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl hover:bg-green-800 transition-all font-semibold disabled:opacity-60"
              >
                {uploading
                  ? <><Loader2 size={18} className="animate-spin" /> Uploading & Publishing...</>
                  : <><Upload size={18} /> Publish Video</>}
              </button>
              <button type="button" onClick={onClose} disabled={uploading}
                className="px-5 py-3 border border-border rounded-xl text-muted-foreground hover:bg-muted transition-all disabled:opacity-50">
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── VideoModal ───────────────────────────────────────────────────────────────
function VideoModal({ video, onClose, onRefresh }: { video: KnowledgeVideo; onClose: () => void; onRefresh: () => void }) {
  const [comments, setComments]             = useState<Comment[]>([]);
  const [newComment, setNewComment]         = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [liked, setLiked]                   = useState(false);
  const [likeCount, setLikeCount]           = useState(video.likeCount || 0);
  const [paying, setPaying]                 = useState(false);
  const [payError, setPayError]             = useState('');
  const [paySuccess, setPaySuccess]         = useState(false);
  const [fullVideo, setFullVideo]           = useState<KnowledgeVideo | null>(null);
  const [loadingVideo, setLoadingVideo]     = useState(true);

  useEffect(() => { loadFullVideo(); loadComments(); }, [video._id]);

  const loadFullVideo = async () => {
    setLoadingVideo(true);
    const data = await apiGet(`/knowledge/${video._id}`);
    if (data.success) setFullVideo(data.video);
    setLoadingVideo(false);
  };
  const loadComments = async () => {
    setLoadingComments(true);
    const data = await apiGet(`/knowledge/${video._id}/comments`);
    if (data.success) setComments(data.comments);
    setLoadingComments(false);
  };
  const handleLike = async () => {
    if (!isLoggedIn()) { alert('Please login to like videos'); return; }
    const data = await apiPost(`/knowledge/${video._id}/like`, {});
    if (data.success) { setLiked(data.liked); setLikeCount(data.likeCount); }
  };
  const handleComment = async () => {
    if (!isLoggedIn()) { alert('Please login to comment'); return; }
    if (!newComment.trim()) return;
    setSubmitting(true);
    const data = await apiPost(`/knowledge/${video._id}/comments`, { text: newComment.trim() });
    if (data.success) { setComments(prev => [data.comment, ...prev]); setNewComment(''); }
    setSubmitting(false);
  };

  // Simulated payment — wire up Razorpay SDK in production
  const handlePayment = async () => {
    if (!isLoggedIn()) { alert('Please login to purchase'); return; }
    setPaying(true); setPayError('');
    try {
      await new Promise(r => setTimeout(r, 1500)); // replace with Razorpay window flow
      const data = await apiPost(`/knowledge/${video._id}/purchase`, {
        paymentId: `simulated_${Date.now()}`,
        method: 'razorpay',
      });
      if (!data.success) throw new Error(data.message);
      setPaySuccess(true);
      await loadFullVideo();
      onRefresh();
    } catch (err: any) {
      setPayError(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const displayVideo = fullVideo || video;
  const hasAccess    = !displayVideo.isPaid || displayVideo.hasAccess || paySuccess;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl my-4"
      >
        {/* VIDEO PLAYER */}
        <div className="relative bg-black aspect-video w-full">
          {loadingVideo ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={40} className="text-white animate-spin" />
            </div>
          ) : hasAccess && displayVideo.videoUrl ? (
            <video
              src={displayVideo.videoUrl}
              controls autoPlay
              className="w-full h-full"
              controlsList="nodownload"
            />
          ) : displayVideo.thumbnailUrl ? (
            <img src={displayVideo.thumbnailUrl} alt={displayVideo.title} className="w-full h-full object-cover opacity-40" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Film size={60} className="text-white/20" />
            </div>
          )}

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors z-10">
            <X size={18} />
          </button>

          {/* Lock overlay on paid + no access */}
          {!loadingVideo && !hasAccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-3">
                <Lock size={28} />
              </div>
              <p className="font-semibold text-lg">Premium Content</p>
              <p className="text-sm opacity-75 mt-1">Purchase to watch this video</p>
            </div>
          )}
        </div>

        {/* PAYMENT WALL */}
        {!loadingVideo && !hasAccess && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <Lock size={22} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Premium Content</h3>
                  <p className="text-sm text-muted-foreground">Purchase once, watch anytime</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-700">₹{displayVideo.price}</p>
                  <p className="text-xs text-muted-foreground">One-time payment</p>
                </div>
                <button
                  onClick={handlePayment} disabled={paying}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-60 shadow-md"
                >
                  {paying
                    ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                    : <><IndianRupee size={16} /> Pay & Unlock</>}
                </button>
              </div>
            </div>
            {payError && (
              <p className="text-red-600 text-sm mt-3 flex items-center gap-1.5">
                <AlertCircle size={14} /> {payError}
              </p>
            )}
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield size={11} /> Secure payment</span>
              <span className="flex items-center gap-1"><CheckCircle size={11} /> Instant access</span>
              <span className="flex items-center gap-1"><Film size={11} /> Watch anytime</span>
            </div>
          </div>
        )}

        {/* VIDEO INFO */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[displayVideo.level]}`}>
                  {displayVideo.level}
                </span>
                <span className="text-xs text-muted-foreground">{displayVideo.category}</span>
                {displayVideo.isPaid && (
                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium flex items-center gap-1">
                    <Lock size={9} /> Premium · ₹{displayVideo.price}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold">{displayVideo.title}</h2>
              {displayVideo.description && (
                <p className="text-muted-foreground text-sm mt-1">{displayVideo.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                    {displayVideo.authorName[0]}
                  </div>
                  <span className="font-medium">{displayVideo.authorName}</span>
                  {displayVideo.authorRole && <span className="text-muted-foreground">· {displayVideo.authorRole}</span>}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye size={12} />{displayVideo.views} views</span>
                {displayVideo.duration && <span className="flex items-center gap-1"><Clock size={12} />{displayVideo.duration}</span>}
              </div>
            </div>
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-medium text-sm flex-shrink-0 ${
                liked ? 'bg-red-50 border-red-200 text-red-600' : 'border-border text-muted-foreground hover:border-red-200 hover:text-red-500'
              }`}
            >
              <Heart size={16} className={liked ? 'fill-red-500' : ''} /> {likeCount}
            </button>
          </div>

          {/* COMMENTS */}
          <div className="border-t border-border pt-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageCircle size={18} className="text-primary" />
              Comments ({comments.length})
            </h3>

            {/* Add comment */}
            <div className="flex gap-3 mb-5">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                {isLoggedIn() ? (getCurrentUser()?.name?.[0] || 'U') : 'G'}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleComment(); }}
                  placeholder={isLoggedIn() ? 'Write a comment...' : 'Login to comment'}
                  disabled={!isLoggedIn() || submitting}
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none disabled:bg-gray-50"
                />
                <button
                  onClick={handleComment}
                  disabled={!isLoggedIn() || !newComment.trim() || submitting}
                  className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>

            {/* Comment list */}
            {loadingComments ? (
              <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                No comments yet — be the first!
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {comments.map(c => (
                  <div key={c._id} className="flex gap-3">
                    <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {c.authorName[0]}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs">{c.authorName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm">{c.text}</p>
                      <button className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <ThumbsUp size={11} /> {c.likeCount}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Knowledge() {
  const { t } = useLanguage();
  const [videos, setVideos]                     = useState<KnowledgeVideo[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [search, setSearch]                     = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVideo, setSelectedVideo]       = useState<KnowledgeVideo | null>(null);
  const [showUpload, setShowUpload]             = useState(false);
  const [toast, setToast]                       = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadVideos = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (search) params.set('search', search);
    const data = await apiGet(`/knowledge?${params}`);
    if (data.success) setVideos(data.videos || []);
    setLoading(false);
  };

  useEffect(() => { loadVideos(); }, [selectedCategory, search]);

  const freeCount  = videos.filter(v => !v.isPaid).length;
  const paidCount  = videos.filter(v => v.isPaid).length;
  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={isLoggedIn()} userRole="buyer" />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm flex items-center gap-2"
          >
            <AlertCircle size={14} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedVideo && (
          <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} onRefresh={loadVideos} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onSuccess={() => { loadVideos(); showToast('Video published successfully!'); }}
          />
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('knowledge.title') || 'Knowledge Hub'}</h1>
          <p className="text-lg text-muted-foreground">Learn from expert farmers — watch, share, and grow together</p>
        </div>

        {/* Upload Banner */}
        <div className="bg-gradient-to-r from-primary to-green-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('knowledge.shareKnowledge') || 'Share Your Knowledge'}</h2>
              <p className="opacity-90">Upload videos, help fellow farmers, and earn from paid content</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm opacity-80">
                <span>✅ Upload your own videos</span>
                <span>✅ Charge for premium content</span>
                <span>✅ Build your farming brand</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (!isLoggedIn()) { showToast('Please login to upload videos'); return; }
                setShowUpload(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-xl hover:bg-green-50 transition-colors font-semibold shadow-md whitespace-nowrap"
            >
              <Upload size={20} />
              {t('knowledge.uploadVideo') || 'Upload Video'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Videos', value: String(videos.length), icon: '🎬' },
            { label: 'Free Videos',  value: String(freeCount),     icon: '🆓' },
            { label: 'Premium',      value: String(paidCount),     icon: '⭐' },
            { label: 'Total Views',  value: totalViews > 1000 ? `${(totalViews/1000).toFixed(1)}K` : String(totalViews), icon: '👁️' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-4 mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text" placeholder="Search videos, topics, farmers..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary'
                }`}
              >{cat}</button>
            ))}
          </div>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={36} className="animate-spin text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <VideoIcon size={48} className="text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground text-lg mb-2">No videos found</p>
            <p className="text-sm text-muted-foreground">Be the first to share your farming knowledge!</p>
            <button
              onClick={() => { if (!isLoggedIn()) { showToast('Please login first'); return; } setShowUpload(true); }}
              className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-green-800 transition-colors font-medium"
            >
              Upload First Video
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video, i) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all group hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden bg-gray-900">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <Film size={36} className="text-gray-600" />
                    </div>
                  )}
                  {/* Play overlay */}
                  <button
                    onClick={() => {
                      if (video.isPaid && !isLoggedIn()) { showToast('Please login to access premium content'); return; }
                      setSelectedVideo(video);
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <Play size={22} className="text-primary ml-1" />
                    </div>
                  </button>
                  {/* Badges */}
                  {video.isPaid ? (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow">
                      <Lock size={10} /> ₹{video.price}
                    </div>
                  ) : (
                    <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow">
                      FREE
                    </div>
                  )}
                  {video.duration && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md font-mono">
                      {video.duration}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[video.level]}`}>
                      {video.level}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{video.category}</span>
                  </div>
                  <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-[10px]">
                      {video.authorName[0]}
                    </div>
                    <span className="truncate">{video.authorName}</span>
                    {video.authorRole && <>
                      <span className="text-gray-300">·</span>
                      <span className="truncate text-gray-400">{video.authorRole}</span>
                    </>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Eye size={11} />{video.views || 0}</span>
                    <span className="flex items-center gap-1"><Heart size={11} />{video.likeCount || 0}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={11} /></span>
                  </div>
                  <button
                    onClick={() => {
                      if (video.isPaid && !isLoggedIn()) { showToast('Please login to access premium content'); return; }
                      setSelectedVideo(video);
                    }}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      video.isPaid
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    {video.isPaid
                      ? <><Lock size={13} /> Unlock · ₹{video.price}</>
                      : <><Play size={13} /> Watch Now</>}
                  </button>
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
