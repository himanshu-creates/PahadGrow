import { useState, useRef, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { getProfile, updateProfile, getCurrentUser, User } from '../../api';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function Profile() {
  const localUser = getCurrentUser();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Partial<User>>({
    name: '', email: '', phone: '', village: '', district: '',
    state: 'Uttarakhand', bio: '', avatar: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      setProfile(res.user);
    } catch {
      if (localUser) setProfile(localUser);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  // ✅ Avatar upload handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error'); return;
    }

    setAvatarUploading(true);
    try {
      const token = localStorage.getItem('pg_token');
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${BASE_URL}/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // Update profile with new avatar URL
      const updated = await updateProfile({ ...profile, avatar: data.url });
      setProfile(updated.user);
      localStorage.setItem('pg_user', JSON.stringify(updated.user));
      showToast('Profile photo updated! ✅');
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({
        name: profile.name, phone: profile.phone,
        village: profile.village, district: profile.district,
        state: profile.state, bio: profile.bio,
      });
      setProfile(res.user);
      localStorage.setItem('pg_user', JSON.stringify(res.user));
      showToast('Profile saved successfully! ✅');
    } catch {
      showToast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof User, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const role = localUser?.role || 'buyer';

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole={role} />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm text-white ${toastType === 'success' ? 'bg-green-700' : 'bg-red-600'}`}>
          {toast}
        </div>
      )}

      <div className="flex">
        <Sidebar role={role} />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-8">Profile Settings</h1>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-border p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start">

                    {/* ✅ Avatar with upload */}
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold border-4 border-white shadow-lg overflow-hidden">
                        {profile.avatar ? (
                          <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          profile.name?.[0]?.toUpperCase() || '?'
                        )}
                        {avatarUploading && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                            <Loader2 size={24} className="text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={avatarUploading}
                        className="absolute bottom-1 right-1 w-9 h-9 bg-green-700 text-white rounded-full flex items-center justify-center shadow-md hover:bg-green-800 transition-colors disabled:opacity-60"
                        title="Change photo"
                      >
                        <Camera size={16} />
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>

                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
                      <p className="text-muted-foreground">{profile.email}</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                        {role}
                      </span>
                      <p className="text-xs text-gray-400 mt-2">Click the camera icon to update your photo</p>
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="bg-white rounded-xl shadow-sm border border-border p-8 space-y-5">
                  <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                      <input type="text" value={profile.name || ''} onChange={e => handleChange('name', e.target.value)}
                        className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" value={profile.email || ''} disabled
                          className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="tel" value={profile.phone || ''} onChange={e => handleChange('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Village</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={profile.village || ''} onChange={e => handleChange('village', e.target.value)}
                          placeholder="Your village"
                          className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">District</label>
                      <input type="text" value={profile.district || ''} onChange={e => handleChange('district', e.target.value)}
                        placeholder="Your district"
                        className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">State</label>
                      <input type="text" value={profile.state || ''} onChange={e => handleChange('state', e.target.value)}
                        className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                    <textarea rows={3} value={profile.bio || ''} onChange={e => handleChange('bio', e.target.value)}
                      placeholder="Tell buyers about yourself and your farm..."
                      className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none" />
                  </div>
                </div>

                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl hover:bg-green-800 transition-all font-semibold shadow-sm disabled:opacity-60">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}