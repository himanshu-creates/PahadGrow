// In-memory store — swap each export with DB queries (Mongoose/Prisma) for production
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

export const users = [
  { id: 'u1', name: 'Demo Buyer', email: 'buyer@demo.com', password: bcrypt.hashSync('demo123', 10), role: 'buyer', phone: '+91 98765 00001', village: 'Delhi', district: 'Delhi', state: 'Delhi', avatar: '', joinedDate: '2025-01-15', bio: 'Looking for fresh organic produce.', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'u2', name: 'Ramesh Negi', email: 'seller@demo.com', password: bcrypt.hashSync('demo123', 10), role: 'seller', phone: '+91 98765 00002', village: 'Mukteshwar', district: 'Nainital', state: 'Uttarakhand', avatar: '', joinedDate: '2025-02-10', bio: 'Organic farmer — apples and honey.', createdAt: '2025-02-10T10:00:00Z' },
  { id: 'u3', name: 'Admin User', email: 'admin@demo.com', password: bcrypt.hashSync('demo123', 10), role: 'admin', phone: '+91 98765 00003', village: 'Dehradun', district: 'Dehradun', state: 'Uttarakhand', avatar: '', joinedDate: '2025-01-01', bio: 'Platform administrator.', createdAt: '2025-01-01T10:00:00Z' },
];

export const products = [
  { id: 'p1', sellerId: 'u2', sellerName: 'Ramesh Negi', sellerVillage: 'Mukteshwar', name: 'Pure Himalayan Honey', category: 'honey', price: 450, originalPrice: 600, unit: '500g', stock: 50, sold: 124, images: ['https://images.unsplash.com/photo-1645549826194-1956802d83c2?w=600', 'https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=600'], description: 'Premium quality pure honey sourced from pristine Himalayan valleys. Our bees collect nectar from wild flowers at high altitudes, giving this honey its unique flavour and medicinal properties. Rich in antioxidants, completely natural.', location: 'Mukteshwar, Nainital', rating: 4.8, reviewCount: 86, tags: ['organic', 'honey', 'himalayan'], status: 'active', createdAt: '2025-03-01T10:00:00Z' },
  { id: 'p2', sellerId: 'u2', sellerName: 'Sunita Rawat', sellerVillage: 'Almora', name: 'Organic Apples', category: 'fruits', price: 120, originalPrice: 120, unit: 'per kg', stock: 200, sold: 89, images: ['https://images.unsplash.com/photo-1587418756582-0c3b4fe798b2?w=600', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600'], description: 'Fresh organic apples from Almora hills. No pesticides, naturally grown in clean mountain air.', location: 'Almora', rating: 4.5, reviewCount: 89, tags: ['organic', 'fruits', 'apples'], status: 'active', createdAt: '2025-03-05T10:00:00Z' },
  { id: 'p3', sellerId: 'u2', sellerName: 'Vijay Singh', sellerVillage: 'Pithoragarh', name: 'Turmeric Powder', category: 'herbs', price: 200, originalPrice: 250, unit: '100g', stock: 80, sold: 67, images: ['https://images.unsplash.com/photo-1698556735172-1b5b3cd9d2ce?w=600'], description: 'Pure organic turmeric powder from Pithoragarh. High curcumin content, stone-ground.', location: 'Pithoragarh', rating: 4.7, reviewCount: 67, tags: ['organic', 'herbs', 'turmeric'], status: 'active', createdAt: '2025-03-08T10:00:00Z' },
  { id: 'p4', sellerId: 'u2', sellerName: 'Meera Bisht', sellerVillage: 'Nainital', name: 'Fresh Dairy Milk', category: 'dairy', price: 60, originalPrice: 60, unit: 'per litre', stock: 100, sold: 203, images: ['https://images.unsplash.com/photo-1635714293982-65445548ac42?w=600'], description: 'Fresh cow milk from Nainital hills. No preservatives, delivered daily.', location: 'Nainital', rating: 4.9, reviewCount: 203, tags: ['dairy', 'milk', 'fresh'], status: 'active', createdAt: '2025-03-10T10:00:00Z' },
  { id: 'p5', sellerId: 'u2', sellerName: 'Harish Negi', sellerVillage: 'Munsiyari', name: 'Wild Forest Honey', category: 'honey', price: 550, originalPrice: 700, unit: '500g', stock: 30, sold: 55, images: ['https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=600'], description: 'Wild honey collected from Munsiyari forests. Rare, medicinal, and naturally harvested.', location: 'Munsiyari, Pithoragarh', rating: 4.6, reviewCount: 55, tags: ['honey', 'wild', 'medicinal'], status: 'active', createdAt: '2025-03-12T10:00:00Z' },
  { id: 'p6', sellerId: 'u2', sellerName: 'Deepak Rawat', sellerVillage: 'Chamoli', name: 'Himalayan Black Rice', category: 'crops', price: 320, originalPrice: 320, unit: 'per kg', stock: 60, sold: 33, images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'], description: 'Rare black rice grown in Chamoli at high altitude. Nutritious and antioxidant-rich.', location: 'Chamoli', rating: 4.8, reviewCount: 33, tags: ['rice', 'organic', 'rare'], status: 'active', createdAt: '2025-03-15T10:00:00Z' },
  { id: 'p7', sellerId: 'u2', sellerName: 'Rekha Bisht', sellerVillage: 'Rudraprayag', name: 'Buransh Juice Concentrate', category: 'herbs', price: 280, originalPrice: 350, unit: '500ml', stock: 45, sold: 78, images: ['https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600'], description: 'Traditional Rhododendron flower juice. Great for immunity and is a local Uttarakhand specialty.', location: 'Rudraprayag', rating: 4.7, reviewCount: 78, tags: ['herbs', 'buransh', 'juice'], status: 'active', createdAt: '2025-03-18T10:00:00Z' },
  { id: 'p8', sellerId: 'u2', sellerName: 'Lata Pandey', sellerVillage: 'Ranikhet', name: 'Red Apples', category: 'fruits', price: 140, originalPrice: 140, unit: 'per kg', stock: 150, sold: 41, images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600'], description: 'Sweet red apples from Ranikhet orchards. Hand-picked at peak ripeness.', location: 'Ranikhet, Almora', rating: 4.4, reviewCount: 41, tags: ['fruits', 'apples', 'organic'], status: 'active', createdAt: '2025-03-20T10:00:00Z' },
];

export const orders = [
  { id: 'o1', buyerId: 'u1', sellerId: 'u2', productId: 'p1', productName: 'Pure Himalayan Honey', quantity: 2, amount: 900, status: 'delivered', date: '2026-03-22T10:00:00Z', shippingAddress: 'Delhi, India' },
  { id: 'o2', buyerId: 'u1', sellerId: 'u2', productId: 'p2', productName: 'Organic Apples', quantity: 5, amount: 600, status: 'shipped', date: '2026-03-24T10:00:00Z', shippingAddress: 'Delhi, India' },
  { id: 'o3', buyerId: 'u1', sellerId: 'u2', productId: 'p3', productName: 'Turmeric Powder', quantity: 2, amount: 400, status: 'processing', date: '2026-03-25T10:00:00Z', shippingAddress: 'Delhi, India' },
];

export const reviews = [
  { id: 'r1', productId: 'p1', userId: 'u1', userName: 'Priya Sharma', rating: 5, comment: 'Very fresh honey, amazing taste. Completely pure!', date: '2026-03-20T10:00:00Z', likes: 12 },
  { id: 'r2', productId: 'p1', userId: 'u1', userName: 'Rahul Kumar', rating: 5, comment: 'Best honey I have ever tasted. Will definitely order again.', date: '2026-03-18T10:00:00Z', likes: 8 },
  { id: 'r3', productId: 'p1', userId: 'u1', userName: 'Anjali Verma', rating: 4, comment: 'Good quality, packaging could be better but taste is great.', date: '2026-03-15T10:00:00Z', likes: 5 },
];

export const landListings = [
  { id: 'l1', ownerId: 'u2', ownerName: 'Ramesh Negi', village: 'Mukteshwar', district: 'Nainital', area: '2.5 Acres', price: 15000, priceUnit: '/month', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600', suitableFor: ['Apples', 'Plums', 'Peaches'], water: true, electricity: true, description: 'Fertile land with mountain view, water facility, perfect for fruit farming.', status: 'available', createdAt: '2025-03-01T10:00:00Z' },
  { id: 'l2', ownerId: 'u2', ownerName: 'Sunita Rawat', village: 'Almora', district: 'Almora', area: '1.8 Acres', price: 12000, priceUnit: '/month', image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600', suitableFor: ['Wheat', 'Barley', 'Potatoes'], water: true, electricity: false, description: 'Terrace land ideal for grain crops and vegetables.', status: 'available', createdAt: '2025-03-05T10:00:00Z' },
  { id: 'l3', ownerId: 'u2', ownerName: 'Vijay Singh', village: 'Pithoragarh', district: 'Pithoragarh', area: '3.0 Acres', price: 18000, priceUnit: '/month', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600', suitableFor: ['Herbs', 'Medicinal Plants', 'Vegetables'], water: true, electricity: true, description: 'High-altitude land perfect for medicinal herb cultivation.', status: 'available', createdAt: '2025-03-10T10:00:00Z' },
];

export const communityPosts = [
  { id: 'cp1', authorId: 'u2', authorName: 'Ramesh Negi', question: 'Best time to harvest apples in Mukteshwar?', content: 'I have recently started apple farming and want to know the optimal harvest time for maximum yield.', likes: 12, replyCount: 5, tags: ['Apples', 'Harvesting'], createdAt: '2026-03-24T08:00:00Z' },
  { id: 'cp2', authorId: 'u2', authorName: 'Sunita Rawat', question: 'Organic pest control methods for herb cultivation', content: 'Looking for natural ways to control pests without chemical pesticides.', likes: 24, replyCount: 8, tags: ['Herbs', 'Organic', 'Pest Control'], createdAt: '2026-03-24T05:00:00Z' },
  { id: 'cp3', authorId: 'u2', authorName: 'Vijay Singh', question: 'Government schemes for beekeeping in Uttarakhand?', content: 'I want to start a honey bee farming business. Any info on government subsidies?', likes: 18, replyCount: 12, tags: ['Beekeeping', 'Government Schemes'], createdAt: '2026-03-23T10:00:00Z' },
];

// Mutable collections (in production, use DB)
export const carts = {};      // userId -> [{productId, quantity}]
export const wishlists = {};  // userId -> [productId]
export const newId = () => uuid();
