import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ShoppingCart, Heart, MapPin, Star, ThumbsUp, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Rating } from '../components/Rating';

export default function ProductDetails() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);

  const product = {
    id: id,
    name: 'Pure Himalayan Honey',
    price: '₹450',
    originalPrice: '₹600',
    discount: '25% OFF',
    images: [
      'https://images.unsplash.com/photo-1645549826194-1956802d83c2?w=600',
      'https://images.unsplash.com/photo-1645549826194-1956802d83c2?w=600',
      'https://images.unsplash.com/photo-1645549826194-1956802d83c2?w=600',
    ],
    description: 'Premium quality pure honey sourced from the pristine Himalayan valleys. Our bees collect nectar from wild flowers at high altitudes, giving this honey its unique flavor and medicinal properties. Rich in antioxidants and completely natural.',
    seller: {
      name: 'Ramesh Negi',
      village: 'Mukteshwar',
      rating: 4.8,
      totalProducts: 12,
      image: 'https://images.unsplash.com/photo-1606203452426-f5af98e6f96e?w=200',
    },
    rating: 4.8,
    reviews: 86,
    inStock: true,
    quantity: '500g',
  };

  const reviews = [
    {
      id: '1',
      user: 'Priya Sharma',
      rating: 5,
      comment: 'Very fresh honey, good quality. The taste is amazing and you can tell it\'s pure.',
      date: '2026-03-20',
      likes: 12,
    },
    {
      id: '2',
      user: 'Rahul Kumar',
      rating: 5,
      comment: 'Excellent product! Best honey I have ever tasted. Will order again.',
      date: '2026-03-18',
      likes: 8,
    },
    {
      id: '3',
      user: 'Anjali Verma',
      rating: 4,
      comment: 'Good honey. Packaging could be better but the quality is great.',
      date: '2026-03-15',
      likes: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn userRole="buyer" />
      
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
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl overflow-hidden mb-4 shadow-sm border border-border">
              <motion.img 
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={product.images[selectedImage]} 
                alt={product.name} 
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-24 object-cover" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl p-6 shadow-lg border border-border hover:shadow-xl transition-shadow">
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-3 mb-4">
                <Rating rating={Math.round(product.rating)} size="md" />
                <span className="text-muted-foreground">({product.reviews} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-primary">{product.price}</span>
                <span className="text-xl text-muted-foreground line-through">{product.originalPrice}</span>
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-lg font-medium">{product.discount}</span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{product.quantity}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${product.inStock ? 'text-secondary' : 'text-destructive'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium flex items-center gap-1">
                    <MapPin size={16} />
                    {product.seller.village}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium shadow-md"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <Heart size={20} />
                </motion.button>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium shadow-md"
              >
                Buy Now
              </motion.button>
            </div>

            {/* Seller Info */}
            <Link to={`/seller-profile/${product.seller.name}`} className="block bg-white rounded-xl p-6 shadow-lg border border-border mt-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <h3 className="font-semibold text-lg mb-4">Seller Information</h3>
              <div className="flex items-center gap-4">
                <img 
                  src={product.seller.image} 
                  alt={product.seller.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{product.seller.name}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin size={14} />
                    {product.seller.village}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Rating rating={Math.round(product.seller.rating)} size="sm" />
                    <span className="text-sm text-muted-foreground">
                      {product.seller.totalProducts} products
                    </span>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Contact
                </motion.button>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Product Description */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-border mb-8 hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </motion.div>

        {/* Reviews Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-border hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Reviews ({product.reviews})</h2>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Write Review
            </motion.button>
          </div>

          <div className="space-y-6">
            {reviews.map((review, index) => (
              <motion.div 
                key={review.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="pb-6 border-b border-border last:border-0 hover:bg-muted/30 p-4 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{review.user}</h4>
                    <Rating rating={review.rating} size="sm" />
                  </div>
                  <span className="text-sm text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-muted-foreground mb-3 leading-relaxed">{review.comment}</p>
                <div className="flex items-center gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ThumbsUp size={16} />
                    <span>Helpful ({review.likes})</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span>Reply</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}