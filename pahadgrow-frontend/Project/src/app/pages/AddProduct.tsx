import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { createProduct } from '../../api';

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    unit: '',
    stock: '',
    description: '',
    location: '',
    tags: '',
    images: [] as string[],
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price) {
      setError('Name, category, and price are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createProduct({
        name: form.name,
        category: form.category,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice || form.price),
        unit: form.unit,
        stock: Number(form.stock || 0),
        description: form.description,
        location: form.location,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: form.images.length > 0 ? form.images : [
          'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600'
        ],
      });
      setSuccess(true);
      setTimeout(() => navigate('/seller'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn userRole="seller" />
        <div className="flex">
          <Sidebar role="seller" />
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Product Published!</h2>
              <p className="text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="seller" />
      <div className="flex">
        <Sidebar role="seller" />
        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-8">Add New Product</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-border p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="e.g., Organic Himalayan Honey"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
                <select
                  value={form.category}
                  onChange={e => handleChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="fruits">Fruits</option>
                  <option value="honey">Honey</option>
                  <option value="dairy">Dairy</option>
                  <option value="herbs">Herbs</option>
                  <option value="crops">Crops</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="spices">Spices</option>
                </select>
              </div>

              {/* Price, Original Price, Unit */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => handleChange('price', e.target.value)}
                    placeholder="450"
                    min="0"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Original Price (₹)</label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={e => handleChange('originalPrice', e.target.value)}
                    placeholder="500"
                    min="0"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Unit</label>
                  <select
                    value={form.unit}
                    onChange={e => handleChange('unit', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="">Select</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="litre">litre</option>
                    <option value="piece">piece</option>
                    <option value="dozen">dozen</option>
                    <option value="box">box</option>
                    <option value="500g">500g</option>
                    <option value="250g">250g</option>
                  </select>
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Available Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={e => handleChange('stock', e.target.value)}
                  placeholder="100"
                  min="0"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Describe your product — freshness, how it's made, health benefits..."
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location *</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => handleChange('location', e.target.value)}
                  placeholder="Village, District, Uttarakhand"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => handleChange('tags', e.target.value)}
                  placeholder="organic, himalayan, natural, fresh"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
                <p className="text-xs text-muted-foreground mt-1">Helps buyers find your product</p>
              </div>

              {/* Image Upload placeholder */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Product Images</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <ImageIcon className="mx-auto mb-3 text-muted-foreground" size={40} />
                  <p className="text-muted-foreground mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB (Max 5 images)</p>
                  <p className="text-xs text-primary mt-2">A default image will be used if none uploaded</p>
                  <input type="file" className="hidden" multiple accept="image/*" />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-800 transition-all font-semibold shadow-sm hover:shadow-md disabled:opacity-60"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  {loading ? 'Publishing...' : 'Publish Product'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/seller')}
                  className="px-6 py-3 border border-border rounded-lg text-muted-foreground hover:bg-muted transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
