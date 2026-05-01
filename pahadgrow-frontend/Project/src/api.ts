// ─── API Service ─────────────────────────────────────────────────────────────
// All backend calls go through here. Change BASE_URL to your deployed backend URL.
// Set VITE_API_URL in .env for production.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  return localStorage.getItem('pg_token');
}

function setToken(t: string) {
  localStorage.setItem('pg_token', t);
}

function clearToken() {
  localStorage.removeItem('pg_token');
  localStorage.removeItem('pg_user');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'landowner' | 'admin';
  phone: string;
  village: string;
  district: string;
  state: string;
  avatar: string;
  joinedDate: string;
  bio: string;
}

export async function login(email: string, password: string) {
  const data = await request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  localStorage.setItem('pg_user', JSON.stringify(data.user));
  return data;
}

export async function register(payload: {
  name: string; email: string; password: string;
  phone?: string; role: string; village?: string; district?: string;
}) {
  const data = await request<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setToken(data.token);
  localStorage.setItem('pg_user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  clearToken();
}

export function getCurrentUser(): User | null {
  try {
    const s = localStorage.getItem('pg_user');
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export async function getMe() {
  return request<{ user: User }>('/auth/me');
}

// ─── Products ─────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerVillage: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  unit: string;
  stock: number;
  sold: number;
  images: string[];
  description: string;
  location: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  status: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
}

export async function getProducts(params?: {
  category?: string; search?: string; sellerId?: string; page?: number; limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.category) q.set('category', params.category);
  if (params?.search) q.set('search', params.search);
  if (params?.sellerId) q.set('sellerId', params.sellerId);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  return request<{ products: Product[]; total: number }>(`/products?${q}`);
}

export async function getProduct(id: string) {
  return request<{ product: Product; reviews: Review[] }>(`/products/${id}`);
}

export async function createProduct(data: Partial<Product>) {
  return request<{ product: Product }>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: Partial<Product>) {
  return request<{ product: Product }>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function addReview(productId: string, rating: number, comment: string) {
  return request<{ review: Review }>(`/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
  status: string;
  date: string;
  shippingAddress: string;
}

export async function getOrders() {
  return request<{ orders: Order[] }>('/orders');
}

export async function placeOrder(productId: string, quantity: number, shippingAddress: string) {
  return request<{ order: Order }>('/orders', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity, shippingAddress }),
  });
}

export async function updateOrderStatus(id: string, status: string) {
  return request<{ order: Order }>(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export async function getCart() {
  return request<{ cart: Array<{ productId: string; quantity: number; product: Product }> }>('/users/cart');
}

export async function addToCart(productId: string, quantity = 1) {
  return request('/users/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function removeFromCart(productId: string) {
  return request(`/users/cart/${productId}`, { method: 'DELETE' });
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export async function getWishlist() {
  return request<{ wishlist: Product[] }>('/users/wishlist');
}

export async function toggleWishlist(productId: string) {
  return request<{ wishlisted: boolean }>(`/users/wishlist/${productId}`, { method: 'POST' });
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export async function getProfile() {
  return request<{ user: User }>('/users/profile');
}

export async function updateProfile(data: Partial<User>) {
  return request<{ user: User }>('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Land ─────────────────────────────────────────────────────────────────────
export interface LandListing {
  id: string;
  ownerId: string;
  ownerName: string;
  village: string;
  district: string;
  area: string;
  price: number;
  priceUnit: string;
  image: string;
  suitableFor: string[];
  water: boolean;
  electricity: boolean;
  description: string;
  status: string;
}

export async function getLandListings(params?: { district?: string; search?: string }) {
  const q = new URLSearchParams();
  if (params?.district) q.set('district', params.district);
  if (params?.search) q.set('search', params.search);
  return request<{ lands: LandListing[] }>(`/users/land?${q}`);
}

// ─── Community ────────────────────────────────────────────────────────────────
export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  question: string;
  content: string;
  likes: number;
  replyCount: number;
  tags: string[];
  createdAt: string;
}

export async function getCommunityPosts() {
  return request<{ posts: CommunityPost[] }>('/users/community');
}

export async function createCommunityPost(question: string, content: string, tags: string[]) {
  return request<{ post: CommunityPost }>('/users/community', {
    method: 'POST',
    body: JSON.stringify({ question, content, tags }),
  });
}

export async function likePost(postId: string) {
  return request<{ likes: number }>(`/users/community/${postId}/like`, { method: 'POST' });
}