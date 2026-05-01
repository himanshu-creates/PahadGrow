import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Product, Land, CommunityPost, Order } from './models.js';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env file');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
    await seedIfEmpty();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

async function seedIfEmpty() {
  const count = await User.countDocuments();
  if (count > 0) return; // already seeded

  console.log('🌱 Seeding demo data...');

  // Users
  const buyer = await User.create({
    name: 'Demo Buyer', email: 'buyer@demo.com',
    password: await bcrypt.hash('demo123', 10),
    role: 'buyer', phone: '+91 98765 00001',
    village: 'Delhi', district: 'Delhi', state: 'Delhi',
    bio: 'Looking for fresh organic produce.',
  });

  const seller = await User.create({
    name: 'Ramesh Negi', email: 'seller@demo.com',
    password: await bcrypt.hash('demo123', 10),
    role: 'seller', phone: '+91 98765 00002',
    village: 'Mukteshwar', district: 'Nainital', state: 'Uttarakhand',
    bio: 'Organic farmer — apples and honey.',
  });

  await User.create({
    name: 'Admin User', email: 'admin@demo.com',
    password: await bcrypt.hash('demo123', 10),
    role: 'admin', phone: '+91 98765 00003',
    village: 'Dehradun', district: 'Dehradun', state: 'Uttarakhand',
    bio: 'Platform administrator.',
  });

  // Products
  const products = await Product.insertMany([
    { sellerId: seller._id, sellerName: 'Ramesh Negi', sellerVillage: 'Mukteshwar', name: 'Pure Himalayan Honey', category: 'honey', price: 450, originalPrice: 600, unit: '500g', stock: 50, sold: 124, images: ['https://images.unsplash.com/photo-1645549826194-1956802d83c2?w=600'], description: 'Premium quality pure honey sourced from pristine Himalayan valleys.', location: 'Mukteshwar, Nainital', rating: 4.8, reviewCount: 86, tags: ['organic', 'honey', 'himalayan'], status: 'active' },
    { sellerId: seller._id, sellerName: 'Sunita Rawat', sellerVillage: 'Almora', name: 'Organic Apples', category: 'fruits', price: 120, originalPrice: 120, unit: 'per kg', stock: 200, sold: 89, images: ['https://images.unsplash.com/photo-1587418756582-0c3b4fe798b2?w=600'], description: 'Fresh organic apples from Almora hills. No pesticides, naturally grown.', location: 'Almora', rating: 4.5, reviewCount: 89, tags: ['organic', 'fruits', 'apples'], status: 'active' },
    { sellerId: seller._id, sellerName: 'Vijay Singh', sellerVillage: 'Pithoragarh', name: 'Turmeric Powder', category: 'herbs', price: 200, originalPrice: 250, unit: '100g', stock: 80, sold: 67, images: ['https://images.unsplash.com/photo-1698556735172-1b5b3cd9d2ce?w=600'], description: 'Pure organic turmeric powder. High curcumin content, stone-ground.', location: 'Pithoragarh', rating: 4.7, reviewCount: 67, tags: ['organic', 'herbs', 'turmeric'], status: 'active' },
    { sellerId: seller._id, sellerName: 'Meera Bisht', sellerVillage: 'Nainital', name: 'Fresh Dairy Milk', category: 'dairy', price: 60, originalPrice: 60, unit: 'per litre', stock: 100, sold: 203, images: ['https://images.unsplash.com/photo-1635714293982-65445548ac42?w=600'], description: 'Fresh cow milk from Nainital hills. No preservatives, delivered daily.', location: 'Nainital', rating: 4.9, reviewCount: 203, tags: ['dairy', 'milk', 'fresh'], status: 'active' },
    { sellerId: seller._id, sellerName: 'Harish Negi', sellerVillage: 'Munsiyari', name: 'Wild Forest Honey', category: 'honey', price: 550, originalPrice: 700, unit: '500g', stock: 30, sold: 55, images: ['https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=600'], description: 'Wild honey collected from Munsiyari forests. Rare and medicinal.', location: 'Munsiyari, Pithoragarh', rating: 4.6, reviewCount: 55, tags: ['honey', 'wild', 'medicinal'], status: 'active' },
    { sellerId: seller._id, sellerName: 'Deepak Rawat', sellerVillage: 'Chamoli', name: 'Himalayan Black Rice', category: 'crops', price: 320, originalPrice: 320, unit: 'per kg', stock: 60, sold: 33, images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'], description: 'Rare black rice grown in Chamoli at high altitude. Antioxidant-rich.', location: 'Chamoli', rating: 4.8, reviewCount: 33, tags: ['rice', 'organic', 'rare'], status: 'active' },
  ]);

  // Demo order
  await Order.create({
    buyerId: buyer._id, sellerId: seller._id,
    productId: products[0]._id, productName: 'Pure Himalayan Honey',
    quantity: 2, amount: 900, status: 'delivered',
    shippingAddress: 'Delhi, India', paymentMethod: 'cod',
  });

  // Land listings
  await Land.insertMany([
    { ownerId: seller._id, ownerName: 'Ramesh Negi', village: 'Mukteshwar', district: 'Nainital', area: '2.5 Acres', price: 15000, priceUnit: '/month', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600', suitableFor: ['Apples', 'Plums', 'Peaches'], water: true, electricity: true, description: 'Fertile land with mountain view, perfect for fruit farming.', status: 'available' },
    { ownerId: seller._id, ownerName: 'Sunita Rawat', village: 'Almora', district: 'Almora', area: '1.8 Acres', price: 12000, priceUnit: '/month', image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600', suitableFor: ['Wheat', 'Barley', 'Potatoes'], water: true, electricity: false, description: 'Terrace land ideal for grain crops and vegetables.', status: 'available' },
    { ownerId: seller._id, ownerName: 'Vijay Singh', village: 'Pithoragarh', district: 'Pithoragarh', area: '3.0 Acres', price: 18000, priceUnit: '/month', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600', suitableFor: ['Herbs', 'Medicinal Plants'], water: true, electricity: true, description: 'High-altitude land perfect for medicinal herb cultivation.', status: 'available' },
  ]);

  // Community posts
  await CommunityPost.insertMany([
    { authorId: seller._id, authorName: 'Ramesh Negi', question: 'Best time to harvest apples in Mukteshwar?', content: 'I have recently started apple farming and want to know the optimal harvest time.', likes: 12, replyCount: 5, tags: ['Apples', 'Harvesting'] },
    { authorId: seller._id, authorName: 'Sunita Rawat', question: 'Organic pest control methods for herb cultivation?', content: 'Looking for natural ways to control pests without chemical pesticides.', likes: 24, replyCount: 8, tags: ['Herbs', 'Organic', 'Pest Control'] },
  ]);

  console.log('✅ Demo data seeded');
}
