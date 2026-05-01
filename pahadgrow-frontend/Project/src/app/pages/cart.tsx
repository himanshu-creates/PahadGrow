import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag, Truck, CreditCard, Banknote, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { getCart, removeFromCart, addToCart, placeOrder, isLoggedIn, getCurrentUser, Product } from '../../api';
import { useLanguage } from '../contexts/LanguageContext';

interface CartItem { productId: string; quantity: number; product: Product; }

type Step = 'cart' | 'address' | 'payment' | 'success';

const COD_LIMIT = 2000; // COD only available for orders below ₹2000

declare global { interface Window { Razorpay: any; } }

export default function Cart() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('cart');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay' | 'card'>('razorpay');
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return; }
    fetchCart();
    // Load Razorpay script
    if (!window.Razorpay) {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(s);
    }
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      setCart(res.cart);
    } catch {}
    finally { setLoading(false); }
  };

  const handleQty = async (productId: string, qty: number) => {
    if (qty < 1) return;
    await addToCart(productId, qty);
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
  };

  const handleRemove = async (productId: string) => {
    await removeFromCart(productId);
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const subtotal = cart.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 49;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!address.trim()) return;
    setPlacing(true);
    try {
      if (paymentMethod === 'razorpay' || paymentMethod === 'card') {
        // Razorpay checkout
        const options = {
          key: 'rzp_test_Sk3SKxj95myrWa', 
          amount: total * 100, // paise
          currency: 'INR',
          name: 'PahadGrow',
          description: `Order for ${cart.length} item(s)`,
          image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=100',
          handler: async (response: any) => {
            // Payment successful — place all orders
            for (const item of cart) {
              await placeOrder(item.productId, item.quantity, address);
            }
            setOrderId(response.razorpay_payment_id || 'TEST_' + Date.now());
            setStep('success');
          },
          prefill: { name: user?.name, email: user?.email, contact: user?.phone },
          theme: { color: '#1B5E20' },
          modal: { ondismiss: () => setPlacing(false) },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setPlacing(false);
        return;
      }

      // COD
      const ids: string[] = [];
      for (const item of cart) {
        const res = await placeOrder(item.productId, item.quantity, address);
        ids.push(res.order.id);
      }
      setOrderId(ids[0] || 'COD_' + Date.now());
      setStep('success');
    } catch (e: any) {
      alert(e.message || 'Order failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={isLoggedIn()} userRole={user?.role || 'buyer'} />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Steps Indicator */}
        {step !== 'success' && (
          <div className="flex items-center gap-3 mb-8">
            {(['cart', 'address', 'payment'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s ? 'bg-primary text-white' :
                  (['cart','address','payment'].indexOf(step) > i) ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-400'
                }`}>{i + 1}</div>
                <span className={`text-sm font-medium capitalize ${step === s ? 'text-primary' : 'text-muted-foreground'}`}>{s}</span>
                {i < 2 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ── STEP 1: CART ── */}
          {step === 'cart' && (
            <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h1 className="text-3xl font-bold mb-6">{t('cart.title')}</h1>
              {cart.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-border">
                  <ShoppingBag size={56} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">{t('cart.empty')}</h3>
                  <Link to="/marketplace" className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors font-medium">
                    <ArrowLeft size={18} /> {t('cart.continueShopping')}
                  </Link>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Items */}
                  <div className="lg:col-span-2 space-y-4">
                    {cart.map(item => (
                      <motion.div key={item.productId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="bg-white rounded-xl border border-border p-4 flex gap-4 hover:shadow-md transition-shadow">
                        <img
                          src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=150'}
                          alt={item.product?.name}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">{item.product?.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{item.product?.category}</p>
                          <p className="text-primary font-bold text-lg mt-1">₹{item.product?.price}/{item.product?.unit}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                              <button onClick={() => handleQty(item.productId, item.quantity - 1)} className="p-2 hover:bg-muted transition-colors">
                                <Minus size={14} />
                              </button>
                              <span className="px-4 py-2 font-semibold text-sm">{item.quantity}</span>
                              <button onClick={() => handleQty(item.productId, item.quantity + 1)} className="p-2 hover:bg-muted transition-colors">
                                <Plus size={14} />
                              </button>
                            </div>
                            <button onClick={() => handleRemove(item.productId)} className="text-red-400 hover:text-red-600 transition-colors p-2">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{(item.product?.price || 0) * item.quantity}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div>
                    <div className="bg-white rounded-xl border border-border p-6 sticky top-24">
                      <h2 className="text-lg font-bold mb-4">{t('cart.orderSummary')}</h2>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('cart.subtotal')} ({cart.length} items)</span>
                          <span className="font-medium">₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('cart.shipping')}</span>
                          <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                            {shipping === 0 ? t('cart.freeShipping') : `₹${shipping}`}
                          </span>
                        </div>
                        <div className="border-t border-border pt-3 flex justify-between text-base font-bold">
                          <span>{t('cart.total')}</span>
                          <span className="text-primary text-xl">₹{total}</span>
                        </div>
                      </div>
                      {shipping > 0 && (
                        <p className="text-xs text-muted-foreground mt-3 bg-green-50 p-2 rounded-lg">
                          🎁 Add ₹{500 - subtotal} more for free delivery!
                        </p>
                      )}
                      <button onClick={() => setStep('address')}
                        className="w-full mt-5 py-3 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors font-semibold shadow-md">
                        {t('cart.checkout')} →
                      </button>
                      <Link to="/marketplace" className="block text-center text-sm text-primary hover:underline mt-3">
                        {t('cart.continueShopping')}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: ADDRESS ── */}
          {step === 'address' && (
            <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h1 className="text-3xl font-bold mb-6">{t('cart.shippingAddress')}</h1>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl border border-border p-6">
                    <div className="flex items-center gap-3 mb-5 p-4 bg-green-50 rounded-lg">
                      <Truck className="text-primary" size={24} />
                      <div>
                        <p className="font-semibold">Delivery to your door</p>
                        <p className="text-sm text-muted-foreground">Most orders delivered in 3-7 days</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input type="text" defaultValue={user?.name} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <input type="tel" defaultValue={user?.phone} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('cart.shippingAddress')} *</label>
                        <textarea
                          rows={4}
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          placeholder={t('cart.addressPlaceholder')}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-white rounded-xl border border-border p-6 sticky top-24">
                    <h2 className="font-bold mb-4">{t('cart.orderSummary')}</h2>
                    <div className="space-y-2 text-sm mb-4">
                      {cart.map(i => (
                        <div key={i.productId} className="flex justify-between">
                          <span className="text-muted-foreground truncate flex-1 mr-2">{i.product?.name} ×{i.quantity}</span>
                          <span className="font-medium">₹{(i.product?.price || 0) * i.quantity}</span>
                        </div>
                      ))}
                      <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span className="text-primary">₹{total}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => address.trim() && setStep('payment')}
                      disabled={!address.trim()}
                      className="w-full py-3 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors font-semibold disabled:opacity-50"
                    >
                      Continue to Payment →
                    </button>
                    <button onClick={() => setStep('cart')} className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      ← Back to Cart
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: PAYMENT ── */}
          {step === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h1 className="text-3xl font-bold mb-6">Payment</h1>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {/* Razorpay / Card */}
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-primary bg-green-50' : 'border-border hover:border-primary/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-primary' : 'border-gray-300'}`}>
                        {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <CreditCard className="text-primary" size={22} />
                      <div>
                        <p className="font-semibold">{t('cart.payWithCard')}</p>
                        <p className="text-sm text-muted-foreground">Card, UPI, NetBanking, Wallet — via Razorpay</p>
                      </div>
                      <div className="ml-auto flex gap-1">
                        {['💳','📱','🏦'].map((e,i) => <span key={i} className="text-xl">{e}</span>)}
                      </div>
                    </div>
                    {paymentMethod === 'razorpay' && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                        🔒 Secure payment via Razorpay. Test card: 4111 1111 1111 1111, any CVV, any future date.
                      </div>
                    )}
                  </div>

                  {/* COD — only if total ≤ COD_LIMIT */}
                  <div
                    onClick={() => total <= COD_LIMIT && setPaymentMethod('cod')}
                    className={`bg-white rounded-xl border-2 p-5 transition-all ${
                      total > COD_LIMIT ? 'opacity-50 cursor-not-allowed border-border' :
                      paymentMethod === 'cod' ? 'border-primary bg-green-50 cursor-pointer' : 'border-border hover:border-primary/50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary' : 'border-gray-300'}`}>
                        {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <Banknote className="text-green-600" size={22} />
                      <div>
                        <p className="font-semibold">{t('cart.payWithCOD')}</p>
                        <p className="text-sm text-muted-foreground">
                          {total > COD_LIMIT
                            ? `COD available only for orders below ₹${COD_LIMIT}`
                            : `Pay cash when your order arrives. ${t('cart.codAvailable')}`
                          }
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && total <= COD_LIMIT && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg text-xs text-green-700">
                        ✅ COD selected. You will pay ₹{total} on delivery.
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <div className="bg-white rounded-xl border border-border p-6 sticky top-24">
                    <h2 className="font-bold mb-4">{t('cart.orderSummary')}</h2>
                    <div className="space-y-2 text-sm mb-1">
                      {cart.map(i => (
                        <div key={i.productId} className="flex justify-between">
                          <span className="text-muted-foreground truncate flex-1 mr-2">{i.product?.name} ×{i.quantity}</span>
                          <span>₹{(i.product?.price || 0) * i.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border pt-3 mt-3 space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping===0?'text-green-600':''}>{shipping===0?'FREE':`₹${shipping}`}</span></div>
                      <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                        <span>Total</span><span className="text-primary text-xl">₹{total}</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-muted-foreground">
                      📍 Delivering to: {address.slice(0, 60)}{address.length > 60 ? '...' : ''}
                    </div>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="w-full mt-4 py-3 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors font-semibold shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {placing ? <Loader2 size={18} className="animate-spin" /> : null}
                      {placing ? 'Processing...' : paymentMethod === 'cod' ? `${t('cart.placeOrder')} (COD)` : `${t('cart.payWithCard')} — ₹${total}`}
                    </button>
                    <button onClick={() => setStep('address')} className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      ← Change Address
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: SUCCESS ── */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 max-w-lg mx-auto">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
              </motion.div>
              <h1 className="text-3xl font-bold text-foreground mb-3">Order Placed! 🎉</h1>
              <p className="text-muted-foreground mb-2">Thank you for your order.</p>
              {orderId && <p className="text-sm font-mono bg-gray-100 rounded-lg px-4 py-2 inline-block mb-6">Order ID: {orderId.slice(0,16)}</p>}
              <div className="bg-white rounded-xl border border-border p-6 text-left mb-6">
                <h3 className="font-semibold mb-3">What happens next?</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  {[
                    { icon: '✅', text: 'Order confirmed by seller', done: true },
                    { icon: '📦', text: 'Packed and ready to ship', done: false },
                    { icon: '🚚', text: 'Out for delivery', done: false },
                    { icon: '🏠', text: 'Delivered to your address', done: false },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 ${item.done ? 'text-green-700 font-medium' : ''}`}>
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Link to="/dashboard" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-800 transition-colors font-semibold">
                  View My Orders
                </Link>
                <Link to="/marketplace" className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium">
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {step !== 'success' && <Footer />}
    </div>
  );
}
