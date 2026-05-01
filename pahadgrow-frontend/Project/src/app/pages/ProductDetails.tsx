import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ShoppingCart, Heart, MapPin, ThumbsUp, MessageCircle, Loader2, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Rating } from '../components/Rating';
import { getProduct, addToCart, toggleWishlist, addReview, isLoggedIn, Product, Review } from '../../api';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await getProduct(id!);
      setProduct(res.product);
      setReviews(res.reviews);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn()) { showToast('Please login to add to cart'); return; }
    setCartLoading(true);
    try {
      await addToCart(product!.id, quantity);
      showToast('Added to cart! 🛒');
    } catch {
      showToast('Failed to add to cart');
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!isLoggedIn()) { showToast('Please login'); return; }
    try {
      const res = await toggleWishlist(product!.id);
      setWishlisted(res.wishlisted);
      showToast(res.wishlisted ? 'Added to wishlist ❤️' : 'Removed from wishlist');
    } catch {
      showToast('Something went wrong');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn()) { showToast('Please login to review'); return; }
    setReviewLoading(true);
    try {
      const res = await addReview(product!.id, reviewRating, reviewComment);
      setReviews(prev => [res.review, ...prev]);
      setReviewComment('');
      setReviewRating(5);
      showToast('Review submitted! ⭐');
    } catch {
      showToast('Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Product not found</h2>
        <Link to="/marketplace" className="text-primary hover:underline">Back to Marketplace</Link>
      </div>
    </div>
  );

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={isLoggedIn()} userRole="buyer" />

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-primary">Marketplace</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white rounded-xl overflow-hidden mb-4 shadow-sm border border-border">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images?.[selectedImage] || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-border">
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                <Rating rating={Math.round(product.rating)} size="md" />
                <span className="text-muted-foreground">({reviews.length} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-primary">₹{product.price}</span>
                {discount > 0 && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">₹{product.originalPrice}</span>
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-lg font-medium">{discount}% OFF</span>
                  </>
                )}
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Unit</span>
                  <span className="font-medium">{product.unit}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Stock</span>
                  <span className={`font-medium ${product.stock > 0 ? 'text-secondary' : 'text-destructive'}`}>
                    {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium flex items-center gap-1">
                    <MapPin size={14} />{product.location}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium capitalize">{product.category}</span>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-sm font-medium text-muted-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-muted transition-colors font-bold">−</button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-muted transition-colors font-bold">+</button>
                </div>
              </div>

              <div className="flex gap-3 mb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={cartLoading || product.stock === 0}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium shadow-md disabled:opacity-60"
                >
                  {cartLoading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                  Add to Cart
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleWishlist}
                  className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <Heart size={20} className={wishlisted ? 'fill-red-500 text-red-500' : ''} />
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={cartLoading || product.stock === 0}
                className="w-full px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium shadow-md disabled:opacity-60"
              >
                Buy Now
              </motion.button>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-border mt-6">
              <h3 className="font-semibold text-lg mb-3">Seller Information</h3>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                  {product.sellerName?.[0]}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{product.sellerName}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin size={14} />{product.sellerVillage}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-border mb-8">
          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Write Review */}
        {isLoggedIn() && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-border mb-8">
            <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)}>
                      <Star size={28} className={star <= reviewRating ? 'fill-accent text-accent' : 'text-muted-foreground'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience with this product..."
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={reviewLoading}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-60 flex items-center gap-2"
              >
                {reviewLoading && <Loader2 size={16} className="animate-spin" />}
                Submit Review
              </button>
            </form>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-border">
          <h2 className="text-2xl font-semibold mb-6">Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="pb-6 border-b border-border last:border-0 p-4 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{review.userName}</h4>
                      <Rating rating={review.rating} size="sm" />
                    </div>
                    <span className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p className="text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <ThumbsUp size={14} />
                      <span>Helpful ({review.likes})</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle size={14} />
                      <span>Reply</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
