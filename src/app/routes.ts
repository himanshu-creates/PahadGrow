import { createBrowserRouter } from 'react-router';
import Landing from './pages/Landing';
import Login from './pages/Login';
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

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/dashboard',
    Component: Dashboard,
  },
  {
    path: '/seller',
    Component: SellerDashboard,
  },
  {
    path: '/seller/add-product',
    Component: AddProduct,
  },
  {
    path: '/seller/products',
    Component: SellerDashboard,
  },
  {
    path: '/seller/orders',
    Component: SellerDashboard,
  },
  {
    path: '/seller/earnings',
    Component: SellerDashboard,
  },
  {
    path: '/seller/reviews',
    Component: SellerDashboard,
  },
  {
    path: '/admin',
    Component: AdminPanel,
  },
  {
    path: '/admin/users',
    Component: AdminPanel,
  },
  {
    path: '/admin/sellers',
    Component: AdminPanel,
  },
  {
    path: '/admin/products',
    Component: AdminPanel,
  },
  {
    path: '/admin/orders',
    Component: AdminPanel,
  },
  {
    path: '/admin/reports',
    Component: AdminPanel,
  },
  {
    path: '/admin/analytics',
    Component: AdminPanel,
  },
  {
    path: '/marketplace',
    Component: Marketplace,
  },
  {
    path: '/product/:id',
    Component: ProductDetails,
  },
  {
    path: '/knowledge',
    Component: Knowledge,
  },
  {
    path: '/land-rental',
    Component: LandRental,
  },
  {
    path: '/community',
    Component: Community,
  },
  {
    path: '/subscription',
    Component: Subscription,
  },
  {
    path: '/profile',
    Component: Profile,
  },
  {
    path: '/orders',
    Component: Dashboard,
  },
  {
    path: '/wishlist',
    Component: Dashboard,
  },
  {
    path: '/seller-profile/:id',
    Component: Profile,
  },
]);
