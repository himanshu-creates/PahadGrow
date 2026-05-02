import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Upload, X, Loader2, CheckCircle, ImagePlus, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { createProduct } from '../../api';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function uploadImages(files: File[]): Promise<string[]> {
  const token = localStorage.getItem('pg_token');
  const formData = new FormData();
  files.forEach(f => formData.append('images', f));

  const res = await fetch(`${BASE_URL}/upload/multiple`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Upload failed');
  return data.urls;
}

export default function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [form, setForm] = useState({
    name: '', category: '', price: '', originalPrice: '',
    unit: 'kg', stock: '', description: '', location: '', tags: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const total = selectedFiles.length + files.length;
    if (total > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    // Validate size
    const oversized = files.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      setError('Each image must be under 5MB');
      return;
    }

    setError('');
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Generate previews
    const newPreviews = [...previewUrls];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setPreviewUrls([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });

    // Reset uploaded URLs when new files selected
    setUploadedUrls([]);
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setUploadedUrls([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      handleFileSelect({ target: { files: e.dataTransfer.files } } as any);
    }
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
      let finalImages = uploadedUrls;

      // Upload images if not already uploaded
      if (selectedFiles.length > 0 && uploadedUrls.length === 0) {
        setUploading(true);
        setUploadProgress(30);
        finalImages = await uploadImages(selectedFiles);
        setUploadedUrls(finalImages);
        setUploadProgress(100);
        setUploading(false);
      }

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
        images: finalImages.length > 0 ? finalImages : [
          'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600'
        ],
      });

      setSuccess(true);
      setTimeout(() => navigate('/seller'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
      setUploading(false);
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={48} className="text-green-600" />
              </div>
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
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-border p-6 space-y-6">

              {/* ── Image Upload ── */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Images <span className="text-gray-400 font-normal">(max 5)</span>
                </label>

                {/* Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mb-3">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img src={url} alt={`preview-${i}`}
                          className="w-full h-full object-cover rounded-xl border-2 border-gray-200" />
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                          <X size={12} />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 text-xs bg-green-700 text-white px-1.5 py-0.5 rounded-md">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                    {previewUrls.length < 5 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center hover:border-green-500 hover:bg-green-50 transition-all">
                        <ImagePlus size={20} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                )}

                {/* Upload area - show only if no previews */}
                {previewUrls.length === 0 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer"
                  >
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <ImagePlus size={24} className="text-green-600" />
                    </div>
                    <p className="text-gray-700 font-medium mb-1">Click or drag images here</p>
                    <p className="text-sm text-gray-400">PNG, JPG, WEBP — max 5MB each, up to 5 images</p>
                    <p className="text-xs text-green-600 mt-2">First image will be the main product photo</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Upload progress */}
                {uploading && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Uploading images...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Product Name *</label>
                <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)}
                  placeholder="e.g., Organic Himalayan Honey" required
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
                <select value={form.category} onChange={e => handleChange('category', e.target.value)} required
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
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
                  <input type="number" value={form.price} onChange={e => handleChange('price', e.target.value)}
                    placeholder="450" min="0" required
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Original Price (₹)</label>
                  <input type="number" value={form.originalPrice} onChange={e => handleChange('originalPrice', e.target.value)}
                    placeholder="500" min="0"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Unit</label>
                  <select value={form.unit} onChange={e => handleChange('unit', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none">
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
                <input type="number" value={form.stock} onChange={e => handleChange('stock', e.target.value)}
                  placeholder="100" min="0"
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea rows={4} value={form.description} onChange={e => handleChange('description', e.target.value)}
                  placeholder="Describe your product — freshness, how it's made, health benefits..."
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location *</label>
                <input type="text" value={form.location} onChange={e => handleChange('location', e.target.value)}
                  placeholder="Village, District, Uttarakhand" required
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
                <input type="text" value={form.tags} onChange={e => handleChange('tags', e.target.value)}
                  placeholder="organic, himalayan, natural, fresh"
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                <p className="text-xs text-muted-foreground mt-1">Helps buyers find your product</p>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-2">
                <button type="submit" disabled={loading || uploading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-green-800 transition-all font-semibold shadow-sm disabled:opacity-60">
                  {loading || uploading
                    ? <><Loader2 size={18} className="animate-spin" /> {uploading ? 'Uploading...' : 'Publishing...'}</>
                    : <><Upload size={18} /> Publish Product</>
                  }
                </button>
                <button type="button" onClick={() => navigate('/seller')}
                  className="px-6 py-3 border border-border rounded-xl text-muted-foreground hover:bg-muted transition-all">
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