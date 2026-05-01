import { useState, useEffect, useRef } from 'react';
import { Bell, X, Package, Truck, CheckCircle, MessageCircle, TrendingDown, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { getOrders, isLoggedIn } from '../../api';

export interface Notification {
  id: string;
  type: 'order_placed' | 'order_shipped' | 'order_delivered' | 'message' | 'price_alert' | 'info';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const ICONS: Record<Notification['type'], any> = {
  order_placed: Package,
  order_shipped: Truck,
  order_delivered: CheckCircle,
  message: MessageCircle,
  price_alert: TrendingDown,
  info: Info,
};

const COLORS: Record<Notification['type'], string> = {
  order_placed: 'text-blue-600 bg-blue-100',
  order_shipped: 'text-purple-600 bg-purple-100',
  order_delivered: 'text-green-600 bg-green-100',
  message: 'text-amber-600 bg-amber-100',
  price_alert: 'text-red-600 bg-red-100',
  info: 'text-gray-600 bg-gray-100',
};

function timeAgo(isoStr: string): string {
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function buildNotificationsFromOrders(orders: any[]): Notification[] {
  const notes: Notification[] = [];
  orders.forEach(order => {
    if (order.status === 'processing' || order.status === 'confirmed') {
      notes.push({
        id: `op_${order.id}`,
        type: 'order_placed',
        title: 'Order Placed',
        body: `Your order for ${order.productName} has been placed successfully.`,
        time: order.date,
        read: false,
      });
    }
    if (order.status === 'shipped') {
      notes.push({
        id: `os_${order.id}`,
        type: 'order_shipped',
        title: 'Order Shipped',
        body: `${order.productName} is on its way to you! Expected in 2-3 days.`,
        time: order.date,
        read: false,
      });
    }
    if (order.status === 'delivered') {
      notes.push({
        id: `od_${order.id}`,
        type: 'order_delivered',
        title: 'Order Delivered',
        body: `${order.productName} has been delivered. Please leave a review!`,
        time: order.date,
        read: true,
      });
    }
  });
  // Add static notifications
  notes.push(
    {
      id: 'info_1',
      type: 'info',
      title: 'Welcome to PahadGrow!',
      body: 'Explore fresh Himalayan products from local farmers.',
      time: new Date(Date.now() - 2 * 86400000).toISOString(),
      read: true,
    },
    {
      id: 'price_1',
      type: 'price_alert',
      title: 'Price Drop Alert',
      body: 'Himalayan Honey price dropped by 15% today!',
      time: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
    {
      id: 'msg_1',
      type: 'message',
      title: 'New Community Reply',
      body: 'Someone replied to your post in the community forum.',
      time: new Date(Date.now() - 7200000).toISOString(),
      read: false,
    }
  );
  return notes.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

export function NotificationBell() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoggedIn()) {
      getOrders().then(res => {
        setNotifications(buildNotificationsFromOrders(res.orders));
      }).catch(() => {
        setNotifications(buildNotificationsFromOrders([]));
      });
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
      >
        <Bell size={20} />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-border z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-green-50 to-white">
              <div>
                <h3 className="font-bold text-base">{t('notifications.title')}</h3>
                {unread > 0 && <p className="text-xs text-muted-foreground">{unread} unread</p>}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline font-medium">
                    {t('notifications.markAllRead')}
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell size={36} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground text-sm">{t('notifications.noNotifications')}</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const Icon = ICONS[notif.type];
                  const colorClass = COLORS[notif.type];
                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={() => markRead(notif.id)}
                      className={`flex gap-3 px-5 py-4 border-b border-border/50 cursor-pointer transition-colors hover:bg-gray-50 ${!notif.read ? 'bg-green-50/50' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold leading-tight ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notif.title}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(notif.time)}</span>
                            <button
                              onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                        {!notif.read && (
                          <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-5 py-3 border-t border-border bg-gray-50/50">
                <button
                  onClick={() => setNotifications([])}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
