import { useState, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { getProfile, updateProfile, getCurrentUser, User } from '../../api';

export default function Profile() {
  const localUser = getCurrentUser();
  const [profile, setProfile] = useState<Partial<User>>({
    name: '', email: '', phone: '', village: '', district: '', state: 'Uttarakhand', bio: '', avatar: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      setProfile(res.user);
    } catch {
      // fallback to local user
      if (localUser) setProfile(localUser);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({
        name: profile.name,
        phone: profile.phone,
        village: profile.village,
        district: profile.district,
        state: profile.state,
        bio: profile.bio,
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
                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-sm border border-border p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold border-4 border-white shadow-lg overflow-hidden">
                        {profile.avatar ? (
                          <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          profile.name?.[0]?.toUpperCase() || '?'
                        )}
                      </div>
                      <button type="button" className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-800 transition-colors">
                        <Camera size={18} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
                        <input
                          type="text"
                          value={profile.name || ''}
                          onChange={e => handleChange('name', e.target.value)}
                          className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg font-semibold"
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {profile.village || 'Village'}, {profile.district || 'District'}
                        </span>
                        <span className="capitalize bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {role}
                        </span>
                        {profile.joinedDate && (
                          <span>Member since {new Date(profile.joinedDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                  <h3 className="text-lg font-semibold mb-4">About Me</h3>
                  <textarea
                    value={profile.bio || ''}
                    onChange={e => handleChange('bio', e.target.value)}
                    rows={3}
                    placeholder="Tell others about yourself, your farm, or your products..."
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Contact */}
                <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                  <h3 className="text-lg font-semibold mb-5">Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
                      <div className="flex items-center gap-3">
                        <Mail size={20} className="text-muted-foreground flex-shrink-0" />
                        <input
                          type="email"
                          value={profile.email || ''}
                          disabled
                          className="flex-1 px-4 py-2.5 border border-border rounded-lg bg-muted/50 text-muted-foreground cursor-not-allowed outline-none"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-8">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Phone Number</label>
                      <div className="flex items-center gap-3">
                        <Phone size={20} className="text-muted-foreground flex-shrink-0" />
                        <input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={e => handleChange('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          className="flex-1 px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                  <h3 className="text-lg font-semibold mb-5">Location</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { label: 'Village', field: 'village' as keyof User, placeholder: 'Your village' },
                      { label: 'District', field: 'district' as keyof User, placeholder: 'e.g., Nainital' },
                      { label: 'State', field: 'state' as keyof User, placeholder: 'Uttarakhand' },
                    ].map(({ label, field, placeholder }) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">{label}</label>
                        <input
                          type="text"
                          value={(profile[field] as string) || ''}
                          onChange={e => handleChange(field, e.target.value)}
                          placeholder={placeholder}
                          className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors font-semibold shadow-md disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={fetchProfile}
                    className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                  >
                    Reset
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
