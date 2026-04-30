import { MapPin, Search, Filter, Ruler, Users, Droplet, Zap } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function LandRental() {
  const lands = [
    {
      id: '1',
      village: 'Mukteshwar',
      district: 'Nainital',
      area: '2.5 Acres',
      price: '₹15,000/month',
      image: 'https://images.unsplash.com/photo-1759593641759-93551a10e9fc?w=600',
      suitableFor: ['Apples', 'Plums', 'Peaches'],
      owner: 'Ramesh Negi',
      waterAvailability: 'Yes',
      electricity: 'Yes',
    },
    {
      id: '2',
      village: 'Almora',
      district: 'Almora',
      area: '1.8 Acres',
      price: '₹12,000/month',
      image: 'https://images.unsplash.com/photo-1759593641759-93551a10e9fc?w=600',
      suitableFor: ['Wheat', 'Barley', 'Potatoes'],
      owner: 'Sunita Rawat',
      waterAvailability: 'Yes',
      electricity: 'No',
    },
    {
      id: '3',
      village: 'Pithoragarh',
      district: 'Pithoragarh',
      area: '3.0 Acres',
      price: '₹18,000/month',
      image: 'https://images.unsplash.com/photo-1759593641759-93551a10e9fc?w=600',
      suitableFor: ['Herbs', 'Medicinal Plants', 'Vegetables'],
      owner: 'Vijay Singh',
      waterAvailability: 'Yes',
      electricity: 'Yes',
    },
    {
      id: '4',
      village: 'Ranikhet',
      district: 'Almora',
      area: '2.2 Acres',
      price: '₹14,000/month',
      image: 'https://images.unsplash.com/photo-1759593641759-93551a10e9fc?w=600',
      suitableFor: ['Vegetables', 'Flowers', 'Herbs'],
      owner: 'Meena Bisht',
      waterAvailability: 'Yes',
      electricity: 'Yes',
    },
  ];

  const districts = ['All Districts', 'Nainital', 'Almora', 'Pithoragarh', 'Dehradun', 'Haridwar', 'Tehri', 'Chamoli', 'Uttarkashi'];
  const landSizes = ['All Sizes', 'Under 1 Acre', '1-2 Acres', '2-3 Acres', 'Above 3 Acres'];
  const cropTypes = ['All Crops', 'Fruits', 'Vegetables', 'Herbs', 'Grains', 'Medicinal Plants'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="buyer" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Land Rental Marketplace</h1>
          <p className="text-lg text-muted-foreground">Find and rent agricultural land in Uttarakhand</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search by village, district, or crop type..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm text-foreground"
            />
          </div>
        </div>

        {/* List Your Land CTA */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl p-8 mb-8 shadow-lg">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-3">Have Land to Rent?</h2>
            <p className="mb-6 opacity-90">
              List your agricultural land and earn passive income while helping other farmers grow
            </p>
            <button className="px-6 py-3 bg-white text-primary rounded-lg hover:bg-white/90 transition-colors font-medium shadow-md">
              List Your Land
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-border mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Filter className="text-primary" size={20} />
            <h3 className="text-lg font-bold text-foreground">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* District Filter */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">District</label>
              <div className="flex flex-wrap gap-2">
                {districts.slice(0, 5).map((district, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      index === 0
                        ? 'bg-primary text-white border border-primary'
                        : 'bg-white text-[#374151] border border-[#D1D5DB] hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32]'
                    }`}
                  >
                    {district}
                  </button>
                ))}
              </div>
            </div>

            {/* Land Size Filter */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">Land Size</label>
              <div className="flex flex-wrap gap-2">
                {landSizes.map((size, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      index === 0
                        ? 'bg-primary text-white border border-primary'
                        : 'bg-white text-[#374151] border border-[#D1D5DB] hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Crop Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">Crop Type</label>
              <div className="flex flex-wrap gap-2">
                {cropTypes.map((crop, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      index === 0
                        ? 'bg-primary text-white border border-primary'
                        : 'bg-white text-[#374151] border border-[#D1D5DB] hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32]'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Uttarakhand Map Section */}
        <div className="bg-white rounded-xl p-8 shadow-md border border-border mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">Explore by District</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Dehradun', 'Haridwar', 'Tehri', 'Uttarkashi', 'Chamoli', 'Rudraprayag', 'Pauri', 'Almora', 'Nainital', 'Pithoragarh', 'Champawat', 'Bageshwar', 'Udham Singh Nagar'].map((district, index) => (
              <button
                key={index}
                className="px-4 py-3 bg-primary/5 border border-primary/30 rounded-lg text-foreground font-medium hover:bg-primary hover:text-white transition-all"
              >
                {district}
              </button>
            ))}
          </div>
        </div>

        {/* Land Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lands.map((land) => (
            <div key={land.id} className="bg-white rounded-xl shadow-md border border-border overflow-hidden hover:shadow-xl transition-all">
              <div className="md:flex">
                {/* Image */}
                <div className="md:w-2/5">
                  <img 
                    src={land.image} 
                    alt={land.village} 
                    className="w-full h-full object-cover min-h-[250px]"
                  />
                </div>
                
                {/* Content */}
                <div className="md:w-3/5 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">{land.village}</h3>
                      <p className="text-muted-foreground flex items-center gap-1.5">
                        <MapPin size={16} />
                        {land.district} District
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{land.price}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    {/* Area */}
                    <div className="flex items-center gap-2">
                      <Ruler className="text-primary" size={18} />
                      <span className="font-semibold text-foreground">Area:</span>
                      <span className="text-muted-foreground">{land.area}</span>
                    </div>
                    
                    {/* Owner */}
                    <div className="flex items-center gap-2">
                      <Users className="text-primary" size={18} />
                      <span className="font-semibold text-foreground">Owner:</span>
                      <span className="text-muted-foreground">{land.owner}</span>
                    </div>

                    {/* Suitable For */}
                    <div>
                      <span className="font-semibold text-foreground">Suitable for:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {land.suitableFor.map((crop, index) => (
                          <span key={index} className="px-3 py-1.5 bg-tag-bg text-primary rounded-full text-sm font-medium border border-primary/20">
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="flex gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${land.waterAvailability === 'Yes' ? 'bg-secondary/20' : 'bg-muted'}`}>
                          <Droplet className={land.waterAvailability === 'Yes' ? 'text-secondary' : 'text-muted-foreground'} size={16} />
                        </div>
                        <span className="text-sm font-medium text-foreground">Water</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${land.electricity === 'Yes' ? 'bg-accent/20' : 'bg-muted'}`}>
                          <Zap className={land.electricity === 'Yes' ? 'text-accent' : 'text-muted-foreground'} size={16} />
                        </div>
                        <span className="text-sm font-medium text-foreground">Electricity</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-[#2E7D32] transition-colors font-medium shadow-sm">
                      View Details
                    </button>
                    <button className="px-5 py-2.5 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium">
                      Contact Owner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}