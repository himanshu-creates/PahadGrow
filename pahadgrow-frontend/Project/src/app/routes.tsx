import { createBrowserRouter } from 'react-router';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminPanel from './pages/AdminPanel';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import AddProduct from './pages/AddProduct';
import Knowledge from './pages/Knowledge';
import LandRental from './pages/LandRental';
import Community from './pages/Community';
import Subscription from './pages/Subscription';
import Profile from './pages/Profile';
import Cart from './pages/cart';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────────
  { path: '/', Component: Landing },
  { path: '/login', Component: Login },
  { path: '/signup', Component: Signup },
  { path: '/marketplace', Component: Marketplace },
  { path: '/product/:id', Component: ProductDetails },
  { path: '/knowledge', Component: Knowledge },
  { path: '/land-rental', Component: LandRental },
  { path: '/community', Component: Community },
  { path: '/subscription', Component: Subscription },

  // ── Buyer routes (require login) ───────────────────────────────────────────
  {
    path: '/dashboard',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: '/orders',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: '/wishlist',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: '/cart',
    element: <ProtectedRoute><Cart /></ProtectedRoute>,
  },
  {
    path: '/profile',
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
  },
  { path: '/seller-profile/:id', Component: Profile },

  // ── Seller/Landowner routes (require seller role) ──────────────────────────
  {
    path: '/seller',
    element: <ProtectedRoute sellerOnly><SellerDashboard /></ProtectedRoute>,
  },
  {
    path: '/seller/add-product',
    element: <ProtectedRoute sellerOnly><AddProduct /></ProtectedRoute>,
  },
  {
    path: '/seller/products',
    element: <ProtectedRoute sellerOnly><SellerDashboard /></ProtectedRoute>,
  },
  {
    path: '/seller/orders',
    element: <ProtectedRoute sellerOnly><SellerDashboard /></ProtectedRoute>,
  },
  {
    path: '/seller/earnings',
    element: <ProtectedRoute sellerOnly><SellerDashboard /></ProtectedRoute>,
  },
  {
    path: '/seller/reviews',
    element: <ProtectedRoute sellerOnly><SellerDashboard /></ProtectedRoute>,
  },

  // ── Admin routes (require admin role) ─────────────────────────────────────
  // All /admin/* paths are guarded: non-admins are redirected to /dashboard
  {
    path: '/admin',
    element: <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>,
  },
  {
    path: '/admin/users',
    element: <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>,
  },
  {
    path: '/admin/products',
    element: <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>,
  },
  {
    path: '/admin/orders',
    element: <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>,
  },
  {
    path: '/admin/sellers',
    element: <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>,
  },
  {
    path: '/admin/analytics',
    element: <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>,
  },
  {
    path: '/admin/reports',
    element: <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>,
  },
]);
