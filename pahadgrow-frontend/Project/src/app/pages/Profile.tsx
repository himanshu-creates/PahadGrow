import { Camera, Mail, Phone, MapPin, Edit } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export default function Profile() {
  const userProfile = {
    name: 'Ramesh Negi',
    email: 'ramesh.negi@example.com',
    phone: '+91 98765 43210',
    village: 'Mukteshwar',
    district: 'Nainital',
    state: 'Uttarakhand',
    avatar: 'https://images.unsplash.com/photo-1606203452426-f5af98e6f96e?w=200',
    joinedDate: 'January 2025',
    bio: 'Organic farmer specializing in Himalayan apples and honey. Passionate about sustainable farming.',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="seller" />
      <div className="flex">
        <Sidebar role="seller" />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-8">Profile Settings</h1>

            {/* Profile Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-8 mb-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="relative">
                  <img 
                    src={userProfile.avatar} 
                    alt={userProfile.name} 
                    className="w-32 h-32 rounded-full object-cover"
                  />
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera size={20} />
                  </button>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{userProfile.name}</h2>
                      <p className="text-muted-foreground">Member since {userProfile.joinedDate}</p>
                    </div>
                    <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
                      <Edit size={18} />
                      Edit Profile
                    </button>
                  </div>
                  <p className="text-muted-foreground mb-4">{userProfile.bio}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-muted-foreground" />
                      <span>{userProfile.village}, {userProfile.district}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-6">
              <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-muted-foreground" />
                    <input
                      type="email"
                      value={userProfile.email}
                      className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-muted-foreground" />
                    <input
                      type="tel"
                      value={userProfile.phone}
                      className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-6">
              <h3 className="text-xl font-semibold mb-6">Location</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Village
                  </label>
                  <input
                    type="text"
                    value={userProfile.village}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    District
                  </label>
                  <input
                    type="text"
                    value={userProfile.district}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={userProfile.state}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-6">
              <h3 className="text-xl font-semibold mb-6">About Me</h3>
              <textarea
                value={userProfile.bio}
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              ></textarea>
            </div>

            {/* Save Button */}
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                Save Changes
              </button>
              <button className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
