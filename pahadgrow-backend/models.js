import mongoose from 'mongoose';

// ─── User ─────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['buyer', 'seller', 'landowner', 'admin'], default: 'buyer' },
  phone:      { type: String, default: '' },
  village:    { type: String, default: '' },
  district:   { type: String, default: '' },
  state:      { type: String, default: 'Uttarakhand' },
  avatar:     { type: String, default: '' },
  bio:        { type: String, default: '' },
  joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
}, { timestamps: true });

// ─── Product ──────────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  sellerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerName:    { type: String, required: true },
  sellerVillage: { type: String, default: '' },
  name:          { type: String, required: true, trim: true },
  category:      { type: String, required: true },
  price:         { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: 0 },
  unit:          { type: String, default: 'kg' },
  stock:         { type: Number, default: 0 },
  sold:          { type: Number, default: 0 },
  images:        [{ type: String }],
  description:   { type: String, default: '' },
  location:      { type: String, default: '' },
  rating:        { type: Number, default: 0 },
  reviewCount:   { type: Number, default: 0 },
  tags:          [{ type: String }],
  status:        { type: String, enum: ['active', 'inactive', 'sold_out'], default: 'active' },
}, { timestamps: true });

// ─── Review ───────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:  { type: String, required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  comment:   { type: String, required: true },
  likes:     { type: Number, default: 0 },
}, { timestamps: true });

// ─── Order ────────────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema({
  buyerId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:     { type: String, required: true },
  quantity:        { type: Number, required: true, min: 1 },
  amount:          { type: Number, required: true },
  status:          { type: String, enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
  shippingAddress: { type: String, required: true },
  paymentMethod:   { type: String, enum: ['razorpay', 'cod', 'card'], default: 'cod' },
  paymentId:       { type: String, default: '' },
  date:            { type: Date, default: Date.now },
}, { timestamps: true });

// ─── Cart ─────────────────────────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:  { type: Number, default: 1, min: 1 },
}, { timestamps: true });

cartItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

// ─── Wishlist ─────────────────────────────────────────────────────────────────
const wishlistSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true });

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

// ─── Land Listing ─────────────────────────────────────────────────────────────
const landSchema = new mongoose.Schema({
  ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName:   { type: String, required: true },
  village:     { type: String, required: true },
  district:    { type: String, required: true },
  area:        { type: String, required: true },
  price:       { type: Number, required: true },
  priceUnit:   { type: String, default: '/month' },
  image:       { type: String, default: '' },
  suitableFor: [{ type: String }],
  water:       { type: Boolean, default: false },
  electricity: { type: Boolean, default: false },
  description: { type: String, default: '' },
  status:      { type: String, enum: ['available', 'rented', 'unavailable'], default: 'available' },
}, { timestamps: true });

// ─── Community Post ───────────────────────────────────────────────────────────
const communityPostSchema = new mongoose.Schema({
  authorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  question:   { type: String, required: true },
  content:    { type: String, required: true },
  likes:      { type: Number, default: 0 },
  replyCount: { type: Number, default: 0 },
  tags:       [{ type: String }],
}, { timestamps: true });

export const User          = mongoose.model('User', userSchema);
export const Product       = mongoose.model('Product', productSchema);
export const Review        = mongoose.model('Review', reviewSchema);
export const Order         = mongoose.model('Order', orderSchema);
export const CartItem      = mongoose.model('CartItem', cartItemSchema);
export const Wishlist      = mongoose.model('Wishlist', wishlistSchema);
export const Land          = mongoose.model('Land', landSchema);
export const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
