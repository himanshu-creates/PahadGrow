import { useState, useEffect } from 'react';
import { MapPin, Search, Ruler, Droplet, Zap, Loader2, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { getLandListings, isLoggedIn, LandListing } from '../../api';

export default function LandRental() {
  const [lands, setLands] = useState<LandListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [toast, setToast] = useState('');

  const districts = ['All Districts', 'Nainital', 'Almora', 'Pithoragarh', 'Chamoli', 'Uttarkashi', 'Dehradun', 'Tehri'];

  useEffect(() => { fetchLands(); }, [district, search]);

  const fetchLands = async () => {
    setLoading(true);
    try {
      const res = await getLandListings({
        district: district && district !== 'All Districts' ? district : undefined,
        search: search || undefined,
      });
      setLands(res.lands);
    } catch {}
    finally { setLoading(false); }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleContact = (land: LandListing) => {
    if (!isLoggedIn()) {
      showToast('Please login to contact owner');
      return;
    }
    showToast(`Contacting ${land.ownerName}... Feature coming soon!`);
  };

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
          <h1 className="text-4xl font-bold text-foreground mb-2">Land Rental</h1>
          <p className="text-lg text-muted-foreground">Rent fertile Himalayan land for your farming needs</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search by village, crops..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <select
              value={district}
              onChange={e => setDistrict(e.target.value)}
              className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white min-w-[180px]"
            >
              {districts.map(d => <option key={d} value={d === 'All Districts' ? '' : d}>{d}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : lands.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-border shadow-sm">
            <MapPin size={40} className="text-muted-foreground mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">No land listings found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lands.map((land, i) => (
              <motion.div
                key={land.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={land.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'}
                    alt={land.village}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${land.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {land.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{land.village}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin size={13} />{land.district}, Uttarakhand
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-lg">₹{land.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">/{land.priceUnit}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Ruler size={14} />{land.area}
                    </span>
                    <span className={`flex items-center gap-1 ${land.water ? 'text-blue-600' : 'text-muted-foreground'}`}>
                      <Droplet size={14} />Water {land.water ? '✓' : '✗'}
                    </span>
                    <span className={`flex items-center gap-1 ${land.electricity ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      <Zap size={14} />Power {land.electricity ? '✓' : '✗'}
                    </span>
                  </div>

                  {land.suitableFor?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {land.suitableFor.map((crop, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                          {crop}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">Owner: <span className="font-medium text-foreground">{land.ownerName}</span></span>
                    <button
                      onClick={() => handleContact(land)}
                      disabled={land.status !== 'available'}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <Phone size={14} />
                      Contact
                    </button>
                  </div>
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
