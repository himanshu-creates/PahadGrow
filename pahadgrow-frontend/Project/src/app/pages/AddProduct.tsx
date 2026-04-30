import { Upload, Image as ImageIcon } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export default function AddProduct() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="seller" />
      <div className="flex">
        <Sidebar role="seller" />
        
        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-8">Add New Product</h1>

            <form className="bg-white rounded-xl shadow-sm border border-border p-6 space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Organic Himalayan Honey"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category *
                </label>
                <select className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                  <option>Select Category</option>
                  <option>Fruits</option>
                  <option>Honey</option>
                  <option>Dairy</option>
                  <option>Herbs</option>
                  <option>Crops</option>
                </select>
              </div>

              {/* Price and Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="450"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Quantity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 500g, 1kg"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe your product in detail..."
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  required
                ></textarea>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  placeholder="Village, District"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Upload Images */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Images *
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <ImageIcon className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG up to 5MB (Max 5 images)
                  </p>
                  <input type="file" className="hidden" multiple accept="image/*" />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-[#2E7D32] transition-all font-medium shadow-sm hover:shadow-md"
                >
                  Publish Product
                </button>
                <button
                  type="button"
                  className="px-6 py-3 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] hover:bg-[#2E7D32] hover:text-white hover:border-[#2E7D32] transition-all shadow-sm"
                >
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}