import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'garhwali' | 'kumaoni';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateText: (text: string) => Promise<string>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}

// MyMemory API lang codes
const LANG_CODES: Record<Language, string> = {
  en: 'en',
  hi: 'hi',
  garhwali: 'hi', // closest supported
  kumaoni: 'hi',  // closest supported
};

// Cache to avoid repeated API calls
const translationCache = new Map<string, string>();

export async function translateViaAPI(text: string, targetLang: Language): Promise<string> {
  if (targetLang === 'en') return text;
  const cacheKey = `${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey)!;

  try {
    const langCode = LANG_CODES[targetLang];
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${langCode}`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = data?.responseData?.translatedText || text;
    translationCache.set(cacheKey, translated);
    return translated;
  } catch {
    return text;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('pahadgrow_language') as Language) || 'en';
  });
  const [isTranslating, setIsTranslating] = useState(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pahadgrow_language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) value = value?.[k];
    // fallback to English
    if (!value) {
      let enValue: any = translations['en'];
      for (const k of keys) enValue = enValue?.[k];
      return enValue || key;
    }
    return value;
  };

  const translateText = useCallback(async (text: string): Promise<string> => {
    if (language === 'en') return text;
    setIsTranslating(true);
    try {
      return await translateViaAPI(text, language);
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateText, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Static Translations ──────────────────────────────────────────────────────
const translations = {
  en: {
    nav: {
      marketplace: 'Marketplace', knowledge: 'Knowledge', landRental: 'Land Rental',
      community: 'Community', login: 'Login', signup: 'Sign Up', language: 'Language',
      cart: 'Cart', notifications: 'Notifications', profile: 'Profile',
    },
    hero: {
      title1: 'Land of Gods - Uttarakhand',
      title2: 'Empowering Uttarakhand Villages, Reducing Migration',
      title3: 'Connecting Farmers, Crops, and Opportunities',
      startSelling: 'Start Selling', explore: 'Explore Opportunities',
    },
    search: {
      placeholder: 'Search Uttarakhand villages, crops, products...',
      placeholderShort: 'Search crops or villages',
    },
    filters: { all: 'All', fruits: 'Fruits', honey: 'Honey', land: 'Land', herbs: 'Herbs' },
    stats: { villages: 'Villages Connected', farmers: 'Farmers Joined', products: 'Products Listed', income: 'Income Generated' },
    sections: {
      rareProducts: 'High-Profit Rare Products', rareProductsDesc: 'Unique Himalayan crops with premium demand',
      migration: 'Stop The Migration. Build The Future.',
      districts: 'Explore by District', districtsDesc: 'Discover opportunities across Uttarakhand',
      success: 'Success Stories', successDesc: 'Real people, real transformation',
      features: 'Why Choose PahadGrow?', featuresDesc: 'Complete ecosystem for rural prosperity',
    },
    features: {
      marketplace: 'Rare Crops Marketplace', marketplaceDesc: 'Sell unique Himalayan crops directly to buyers across India',
      knowledge: 'Knowledge Sharing', knowledgeDesc: 'Learn modern farming techniques and share your expertise',
      landRental: 'Land Rental', landRentalDesc: 'Rent or lease agricultural land to maximize earnings',
      community: 'Community Forum', communityDesc: 'Connect with fellow farmers and get expert advice',
    },
    cta: {
      title: 'Ready to Transform Your Future?',
      subtitle: 'Join 5000+ farmers already earning with PahadGrow',
      getStarted: 'Get Started Today', viewPlans: 'View Plans',
    },
    dashboard: {
      title: 'Dashboard', userPanel: 'User Panel', sellerPanel: 'Seller Panel', adminPanel: 'Admin Panel',
      myOrders: 'My Orders', wishlist: 'Wishlist', profile: 'Profile',
      addProduct: 'Add Product', myProducts: 'My Products', orders: 'Orders', earnings: 'Earnings', reviews: 'Reviews',
    },
    community: {
      title: 'Community Forum', postQuestion: 'Post Question', askQuestion: 'Ask a Question',
      discussions: 'Discussions', categories: 'Categories', trending: 'Trending Topics', recent: 'Recent Posts',
    },
    knowledge: {
      title: 'Knowledge Center', videoTutorials: 'Video Tutorials', searchVideos: 'Search videos...',
      categories: 'Categories', allCategories: 'All Categories', farming: 'Farming', crops: 'Crops', techniques: 'Techniques',
      shareKnowledge: 'Share Your Knowledge', uploadVideo: 'Upload Video', watchNow: 'Watch Now',
      free: 'Free', premium: 'Premium', views: 'views', articles: 'Articles', expertTips: 'Expert Tips',
    },
    cart: {
      title: 'Your Cart', empty: 'Your cart is empty', checkout: 'Proceed to Checkout',
      continueShopping: 'Continue Shopping', orderSummary: 'Order Summary',
      subtotal: 'Subtotal', shipping: 'Shipping', total: 'Total',
      freeShipping: 'Free Shipping', codAvailable: 'COD Available',
      placeOrder: 'Place Order', payWithCard: 'Pay with Card / UPI',
      payWithCOD: 'Cash on Delivery', shippingAddress: 'Shipping Address',
      addressPlaceholder: 'Enter your full address with pincode',
    },
    notifications: {
      title: 'Notifications', markAllRead: 'Mark all read', noNotifications: 'No notifications yet',
      orderPlaced: 'Order Placed', orderShipped: 'Order Shipped', orderDelivered: 'Order Delivered',
      newMessage: 'New Message', priceAlert: 'Price Alert',
    },
    landRental: {
      title: 'Land Rental Marketplace', searchLand: 'Search by location...',
      filters: 'Filters', district: 'District', landType: 'Land Type',
      priceRange: 'Price Range', available: 'Available', viewDetails: 'View Details',
    },
    marketplace: {
      title: 'Marketplace', searchProducts: 'Search products...',
      categories: 'Categories', filters: 'Filters', sortBy: 'Sort By',
      addToCart: 'Add to Cart', buyNow: 'Buy Now', addedToWishlist: 'Added to Wishlist',
    },
    auth: {
      welcomeBack: 'Welcome Back', createAccount: 'Create Account',
      loginToContinue: 'Login to continue', joinToday: 'Join PahadGrow today',
      email: 'Email Address', phone: 'Phone Number', password: 'Password',
      rememberMe: 'Remember me', forgotPassword: 'Forgot password?',
      login: 'Login', signup: 'Sign Up', continueWith: 'Or continue with',
      alreadyAccount: 'Already have an account?', noAccount: "Don't have an account?",
      iAm: 'I am a:', buyer: 'Buyer', seller: 'Seller (Farmer)', landowner: 'Land Owner', admin: 'Admin',
    },
    common: {
      loading: 'Loading...', save: 'Save', cancel: 'Cancel', delete: 'Delete',
      edit: 'Edit', view: 'View', close: 'Close', submit: 'Submit',
      search: 'Search', filter: 'Filter', sort: 'Sort', next: 'Next',
      previous: 'Previous', continue: 'Continue', remove: 'Remove',
    },
    languageSelection: {
      title: 'Choose Your Language', titleHindi: 'अपनी भाषा चुनें',
      subtitle: 'Select your preferred language to continue',
      english: 'English', hindi: 'हिंदी', garhwali: 'गढ़वाली', kumaoni: 'कुमाऊँनी', continue: 'Continue',
    },
  },
  hi: {
    nav: {
      marketplace: 'बाज़ार', knowledge: 'सीखें', landRental: 'जमीन किराये पर',
      community: 'समुदाय', login: 'लॉगिन', signup: 'साइन अप', language: 'भाषा',
      cart: 'कार्ट', notifications: 'सूचनाएं', profile: 'प्रोफ़ाइल',
    },
    hero: {
      title1: 'देवभूमि उत्तराखंड',
      title2: 'उत्तराखंड गांवों को सशक्त बनाना, पलायन कम करना',
      title3: 'किसानों, फसलों और अवसरों को जोड़ना',
      startSelling: 'बेचना शुरू करें', explore: 'अवसर देखें',
    },
    search: { placeholder: 'उत्तराखंड गांव, फसल, उत्पाद खोजें...', placeholderShort: 'फसल या गांव खोजें' },
    filters: { all: 'सभी', fruits: 'फल', honey: 'शहद', land: 'जमीन', herbs: 'जड़ी-बूटी' },
    stats: { villages: 'जुड़े गांव', farmers: 'शामिल किसान', products: 'सूचीबद्ध उत्पाद', income: 'उत्पन्न आय' },
    sections: {
      rareProducts: 'उच्च लाभ दुर्लभ उत्पाद', rareProductsDesc: 'प्रीमियम मांग वाली अनूठी हिमालयी फसलें',
      migration: 'पलायन रोकें। भविष्य बनाएं।',
      districts: 'जिलों के अनुसार खोजें', districtsDesc: 'उत्तराखंड में अवसर खोजें',
      success: 'सफलता की कहानियां', successDesc: 'वास्तविक लोग, वास्तविक परिवर्तन',
      features: 'पाहाड़ग्रो क्यों चुनें?', featuresDesc: 'ग्रामीण समृद्धि के लिए पूर्ण पारिस्थितिकी तंत्र',
    },
    features: {
      marketplace: 'दुर्लभ फसल बाज़ार', marketplaceDesc: 'अनोखी हिमालयी फसलें पूरे भारत में बेचें',
      knowledge: 'ज्ञान साझाकरण', knowledgeDesc: 'आधुनिक खेती तकनीक सीखें',
      landRental: 'जमीन किराये पर', landRentalDesc: 'कृषि भूमि किराए पर दें',
      community: 'सामुदायिक मंच', communityDesc: 'साथी किसानों से जुड़ें',
    },
    cta: {
      title: 'अपना भविष्य बदलने के लिए तैयार हैं?',
      subtitle: '5000+ किसान पहले से ही पाहाड़ग्रो के साथ कमाई कर रहे हैं',
      getStarted: 'आज ही शुरू करें', viewPlans: 'योजनाएं देखें',
    },
    dashboard: {
      title: 'डैशबोर्ड', userPanel: 'उपयोगकर्ता पैनल', sellerPanel: 'विक्रेता पैनल', adminPanel: 'व्यवस्थापक पैनल',
      myOrders: 'मेरे आदेश', wishlist: 'इच्छा सूची', profile: 'प्रोफ़ाइल',
      addProduct: 'उत्पाद जोड़ें', myProducts: 'मेरे उत्पाद', orders: 'आदेश', earnings: 'कमाई', reviews: 'समीक्षाएं',
    },
    community: {
      title: 'सामुदायिक मंच', postQuestion: 'प्रश्न पूछें', askQuestion: 'प्रश्न पूछें',
      discussions: 'चर्चा', categories: 'श्रेणियाँ', trending: 'ट्रेंडिंग विषय', recent: 'हालिया पोस्ट',
    },
    knowledge: {
      title: 'ज्ञान केंद्र', videoTutorials: 'वीडियो ट्यूटोरियल', searchVideos: 'वीडियो खोजें...',
      categories: 'श्रेणियाँ', allCategories: 'सभी श्रेणियाँ', farming: 'खेती', crops: 'फसलें', techniques: 'तकनीक',
      shareKnowledge: 'ज्ञान साझा करें', uploadVideo: 'वीडियो अपलोड करें', watchNow: 'अभी देखें',
      free: 'मुफ्त', premium: 'प्रीमियम', views: 'दृश्य', articles: 'लेख', expertTips: 'विशेषज्ञ सुझाव',
    },
    cart: {
      title: 'आपका कार्ट', empty: 'आपका कार्ट खाली है', checkout: 'चेकआउट करें',
      continueShopping: 'खरीदारी जारी रखें', orderSummary: 'ऑर्डर सारांश',
      subtotal: 'उप-कुल', shipping: 'डिलीवरी', total: 'कुल',
      freeShipping: 'मुफ्त डिलीवरी', codAvailable: 'कैश ऑन डिलीवरी उपलब्ध',
      placeOrder: 'ऑर्डर दें', payWithCard: 'कार्ड / UPI से भुगतान', payWithCOD: 'कैश ऑन डिलीवरी',
      shippingAddress: 'डिलीवरी पता', addressPlaceholder: 'पूरा पता पिनकोड के साथ लिखें',
    },
    notifications: {
      title: 'सूचनाएं', markAllRead: 'सब पढ़ा', noNotifications: 'कोई सूचना नहीं',
      orderPlaced: 'ऑर्डर हुआ', orderShipped: 'भेजा गया', orderDelivered: 'मिल गया',
      newMessage: 'नया संदेश', priceAlert: 'कीमत बदली',
    },
    landRental: {
      title: 'जमीन किराया बाज़ार', searchLand: 'स्थान से खोजें...', filters: 'फ़िल्टर',
      district: 'जिला', landType: 'भूमि प्रकार', priceRange: 'मूल्य सीमा', available: 'उपलब्ध', viewDetails: 'विवरण देखें',
    },
    marketplace: {
      title: 'बाज़ार', searchProducts: 'उत्पाद खोजें...', categories: 'श्रेणियाँ',
      filters: 'फ़िल्टर', sortBy: 'क्रमबद्ध करें', addToCart: 'कार्ट में जोड़ें', buyNow: 'अभी खरीदें',
      addedToWishlist: 'इच्छा सूची में जोड़ा',
    },
    auth: {
      welcomeBack: 'वापसी पर स्वागत है', createAccount: 'खाता बनाएं',
      loginToContinue: 'जारी रखने के लिए लॉगिन करें', joinToday: 'आज ही पाहाड़ग्रो में शामिल हों',
      email: 'ईमेल पता', phone: 'फ़ोन नंबर', password: 'पासवर्ड',
      rememberMe: 'मुझे याद रखें', forgotPassword: 'पासवर्ड भूल गए?',
      login: 'लॉगिन', signup: 'साइन अप', continueWith: 'या जारी रखें',
      alreadyAccount: 'पहले से खाता है?', noAccount: 'खाता नहीं है?',
      iAm: 'मैं हूँ:', buyer: 'खरीदार', seller: 'विक्रेता (किसान)', landowner: 'जमीन मालिक', admin: 'व्यवस्थापक',
    },
    common: {
      loading: 'लोड हो रहा है...', save: 'सहेजें', cancel: 'रद्द करें', delete: 'हटाएं',
      edit: 'संपादित करें', view: 'देखें', close: 'बंद करें', submit: 'जमा करें',
      search: 'खोजें', filter: 'फ़िल्टर', sort: 'क्रमबद्ध करें', next: 'अगला',
      previous: 'पिछला', continue: 'जारी रखें', remove: 'हटाएं',
    },
    languageSelection: {
      title: 'अपनी भाषा चुनें', titleHindi: 'अपनी भाषा चुनें',
      subtitle: 'जारी रखने के लिए अपनी पसंदीदा भाषा चुनें',
      english: 'English', hindi: 'हिंदी', garhwali: 'गढ़वाली', kumaoni: 'कुमाऊँनी', continue: 'जारी रखें',
    },
  },
  garhwali: {
    nav: {
      marketplace: 'बाजार', knowledge: 'सीखण', landRental: 'जमीन किराया',
      community: 'समुदाय', login: 'लॉगिन', signup: 'साइन अप', language: 'भाषा',
      cart: 'कार्ट', notifications: 'सूचना', profile: 'प्रोफाइल',
    },
    hero: {
      title1: 'देवभूमि उत्तराखंड',
      title2: 'उत्तराखंड गांवों कू सशक्त बनाणा, पलायन कम करणा',
      title3: 'किसानों, फसलों अर मौकों कू जोड़णा',
      startSelling: 'बेचण शुरू', explore: 'मौका देखो',
    },
    search: { placeholder: 'गांव, फसल, उत्पाद खोजो...', placeholderShort: 'फसल या गांव खोजो' },
    filters: { all: 'सब', fruits: 'फल', honey: 'शहद', land: 'जमीन', herbs: 'जड़ी-बूटी' },
    stats: { villages: 'जुड़े गांव', farmers: 'किसान', products: 'उत्पाद', income: 'कमाई' },
    sections: {
      rareProducts: 'दुर्लभ उत्पाद', rareProductsDesc: 'हिमालयी फसलें',
      migration: 'पलायन रोको। भविष्य बनाओ।',
      districts: 'जिलों देखो', districtsDesc: 'उत्तराखंड में मौका',
      success: 'सफलता कथा', successDesc: 'असली लोग, असली बदलाव',
      features: 'पाहाड़ग्रो क्यों?', featuresDesc: 'ग्रामीण समृद्धि',
    },
    features: {
      marketplace: 'फसल बाजार', marketplaceDesc: 'हिमालयी फसलें बेचो',
      knowledge: 'ज्ञान', knowledgeDesc: 'खेती सीखो',
      landRental: 'जमीन किराया', landRentalDesc: 'जमीन किराये पर द्यो',
      community: 'समुदाय', communityDesc: 'किसानों स जुड़ो',
    },
    cta: { title: 'भविष्य बदलो', subtitle: '5000+ किसान कमा रये', getStarted: 'शुरू करो', viewPlans: 'योजना देखो' },
    dashboard: {
      title: 'डैशबोर्ड', userPanel: 'यूजर पैनल', sellerPanel: 'विक्रेता पैनल', adminPanel: 'एडमिन पैनल',
      myOrders: 'मेरा आर्डर', wishlist: 'इच्छा', profile: 'प्रोफाइल',
      addProduct: 'उत्पाद जोड़ो', myProducts: 'मेरा उत्पाद', orders: 'आर्डर', earnings: 'कमाई', reviews: 'रिव्यू',
    },
    community: {
      title: 'समुदाय', postQuestion: 'प्रश्न पूछो', askQuestion: 'प्रश्न पूछो',
      discussions: 'चर्चा', categories: 'श्रेणी', trending: 'ट्रेंडिंग', recent: 'नया पोस्ट',
    },
    knowledge: {
      title: 'ज्ञान केंद्र', videoTutorials: 'वीडियो', searchVideos: 'वीडियो खोजो...',
      categories: 'श्रेणी', allCategories: 'सब श्रेणी', farming: 'खेती', crops: 'फसल', techniques: 'तकनीक',
      shareKnowledge: 'ज्ञान बांटो', uploadVideo: 'वीडियो डालो', watchNow: 'देखो',
      free: 'मुफ्त', premium: 'पेड', views: 'व्यू', articles: 'लेख', expertTips: 'सुझाव',
    },
    cart: {
      title: 'तुमार कार्ट', empty: 'कार्ट खाली छ', checkout: 'चेकआउट',
      continueShopping: 'खरीदारी जारी', orderSummary: 'ऑर्डर जानकारी',
      subtotal: 'कुल', shipping: 'डिलीवरी', total: 'जोड़',
      freeShipping: 'मुफ्त डिलीवरी', codAvailable: 'COD उपलब्ध',
      placeOrder: 'ऑर्डर करो', payWithCard: 'कार्ड से भरो', payWithCOD: 'कैश दो',
      shippingAddress: 'पता', addressPlaceholder: 'पूरा पता लिखो',
    },
    notifications: {
      title: 'सूचना', markAllRead: 'सब पढ़ो', noNotifications: 'कोई सूचना नहीं',
      orderPlaced: 'ऑर्डर भो', orderShipped: 'भेजे गो', orderDelivered: 'मिल गो',
      newMessage: 'नया संदेश', priceAlert: 'कीमत बदली',
    },
    landRental: {
      title: 'जमीन किराया', searchLand: 'जगा खोजो...', filters: 'फिल्टर',
      district: 'जिला', landType: 'जमीन प्रकार', priceRange: 'मूल्य', available: 'उपलब्ध', viewDetails: 'विवरण',
    },
    marketplace: {
      title: 'बाजार', searchProducts: 'उत्पाद खोजो...', categories: 'श्रेणी',
      filters: 'फिल्टर', sortBy: 'क्रम', addToCart: 'कार्ट में', buyNow: 'खरीदो', addedToWishlist: 'इच्छा में जोड़ो',
    },
    auth: {
      welcomeBack: 'फिर आओ', createAccount: 'खाता बनाओ',
      loginToContinue: 'लॉगिन करो', joinToday: 'आज जुड़ो',
      email: 'ईमेल', phone: 'फोन', password: 'पासवर्ड',
      rememberMe: 'याद रखो', forgotPassword: 'पासवर्ड भूल गए?',
      login: 'लॉगिन', signup: 'साइन अप', continueWith: 'या जारी',
      alreadyAccount: 'खाता छ?', noAccount: 'खाता नहीं?',
      iAm: 'मैं छूं:', buyer: 'खरीदार', seller: 'विक्रेता', landowner: 'जमीन मालिक', admin: 'एडमिन',
    },
    common: {
      loading: 'लोड...', save: 'सेव', cancel: 'रद्द', delete: 'डिलीट',
      edit: 'बदलो', view: 'देखो', close: 'बंद', submit: 'भेजो',
      search: 'खोजो', filter: 'फिल्टर', sort: 'क्रम', next: 'अगला',
      previous: 'पिछला', continue: 'जारी', remove: 'हटाओ',
    },
    languageSelection: {
      title: 'भाषा चुनो', titleHindi: 'अपनी भाषा चुनें', subtitle: 'भाषा चुनो',
      english: 'English', hindi: 'हिंदी', garhwali: 'गढ़वाली', kumaoni: 'कुमाऊँनी', continue: 'जारी',
    },
  },
  kumaoni: {
    nav: {
      marketplace: 'बाजार', knowledge: 'सीख', landRental: 'जमीन किराया',
      community: 'समुदाय', login: 'लॉगिन', signup: 'साइन अप', language: 'भाषा',
      cart: 'कार्ट', notifications: 'सूचना', profile: 'प्रोफाइल',
    },
    hero: {
      title1: 'देवभूमि उत्तराखंड',
      title2: 'उत्तराखंड गांव कु सशक्त बनौण, पलायन कम करण',
      title3: 'किसान, फसल अर मौका जोड़ण',
      startSelling: 'बेच शुरू', explore: 'मौका देख',
    },
    search: { placeholder: 'गांव, फसल खोज...', placeholderShort: 'फसल या गांव खोज' },
    filters: { all: 'सब', fruits: 'फल', honey: 'शहद', land: 'जमीन', herbs: 'जड़ी-बूटी' },
    stats: { villages: 'जुड़ा गांव', farmers: 'किसान', products: 'उत्पाद', income: 'कमाई' },
    sections: {
      rareProducts: 'दुर्लभ उत्पाद', rareProductsDesc: 'हिमालय फसल',
      migration: 'पलायन रोक। भविष्य बना।',
      districts: 'जिला देख', districtsDesc: 'उत्तराखंड मौका',
      success: 'सफलता कथा', successDesc: 'असली लोग, बदलाव',
      features: 'पाहाड़ग्रो क्यों?', featuresDesc: 'ग्रामीण समृद्धि',
    },
    features: {
      marketplace: 'फसल बाजार', marketplaceDesc: 'हिमालय फसल बेच',
      knowledge: 'ज्ञान', knowledgeDesc: 'खेती सीख',
      landRental: 'जमीन किराया', landRentalDesc: 'जमीन किराया दे',
      community: 'समुदाय', communityDesc: 'किसान स जुड़',
    },
    cta: { title: 'भविष्य बदल', subtitle: '5000+ किसान कमा रये', getStarted: 'शुरू कर', viewPlans: 'योजना देख' },
    dashboard: {
      title: 'डैशबोर्ड', userPanel: 'यूजर पैनल', sellerPanel: 'बेचणवाल पैनल', adminPanel: 'एडमिन पैनल',
      myOrders: 'मेर आर्डर', wishlist: 'इच्छा', profile: 'प्रोफाइल',
      addProduct: 'उत्पाद जोड़', myProducts: 'मेर उत्पाद', orders: 'आर्डर', earnings: 'कमाई', reviews: 'रिव्यू',
    },
    community: {
      title: 'समुदाय', postQuestion: 'प्रश्न पूछ', askQuestion: 'प्रश्न पूछ',
      discussions: 'चर्चा', categories: 'श्रेणी', trending: 'ट्रेंडिंग', recent: 'नौ पोस्ट',
    },
    knowledge: {
      title: 'ज्ञान केंद्र', videoTutorials: 'वीडियो', searchVideos: 'वीडियो खोज...',
      categories: 'श्रेणी', allCategories: 'सब श्रेणी', farming: 'खेती', crops: 'फसल', techniques: 'तकनीक',
      shareKnowledge: 'ज्ञान बाँट', uploadVideo: 'वीडियो डाल', watchNow: 'देख',
      free: 'मुफ्त', premium: 'पेड', views: 'व्यू', articles: 'लेख', expertTips: 'सुझाव',
    },
    cart: {
      title: 'तुमर कार्ट', empty: 'कार्ट खाली छ', checkout: 'चेकआउट',
      continueShopping: 'खरीद जारी', orderSummary: 'ऑर्डर जानकारी',
      subtotal: 'कुल', shipping: 'डिलीवरी', total: 'जोड़',
      freeShipping: 'मुफ्त डिलीवरी', codAvailable: 'COD उपलब्ध',
      placeOrder: 'ऑर्डर कर', payWithCard: 'कार्ड से दे', payWithCOD: 'नगद दे',
      shippingAddress: 'पता', addressPlaceholder: 'पूरा पता लिख',
    },
    notifications: {
      title: 'सूचना', markAllRead: 'सब पढ़', noNotifications: 'कोई सूचना नैं',
      orderPlaced: 'ऑर्डर भो', orderShipped: 'भेजे गो', orderDelivered: 'मिल गो',
      newMessage: 'नौ संदेश', priceAlert: 'कीमत बदली',
    },
    landRental: {
      title: 'जमीन किराया', searchLand: 'जगा खोज...', filters: 'फिल्टर',
      district: 'जिला', landType: 'जमीन प्रकार', priceRange: 'मूल्य', available: 'उपलब्ध', viewDetails: 'विवरण',
    },
    marketplace: {
      title: 'बाजार', searchProducts: 'उत्पाद खोज...', categories: 'श्रेणी',
      filters: 'फिल्टर', sortBy: 'क्रम', addToCart: 'कार्ट मा', buyNow: 'खरीद', addedToWishlist: 'इच्छा मा जोड़',
    },
    auth: {
      welcomeBack: 'वापस आओ', createAccount: 'खाता बना',
      loginToContinue: 'लॉगिन कर', joinToday: 'आज जुड़',
      email: 'ईमेल', phone: 'फोन', password: 'पासवर्ड',
      rememberMe: 'याद रख', forgotPassword: 'पासवर्ड भूल गै?',
      login: 'लॉगिन', signup: 'साइन अप', continueWith: 'या जारी',
      alreadyAccount: 'खाता छ?', noAccount: 'खाता नैं?',
      iAm: 'मैं छूं:', buyer: 'खरीदार', seller: 'बेचणवाल', landowner: 'जमीन मालिक', admin: 'एडमिन',
    },
    common: {
      loading: 'लोड...', save: 'सेव', cancel: 'रद्द', delete: 'डिलीट',
      edit: 'बदल', view: 'देख', close: 'बंद', submit: 'भेज',
      search: 'खोज', filter: 'फिल्टर', sort: 'क्रम', next: 'अगला',
      previous: 'पिछला', continue: 'जारी', remove: 'हटा',
    },
    languageSelection: {
      title: 'भाषा चुन', titleHindi: 'अपनी भाषा चुनें', subtitle: 'भाषा चुन',
      english: 'English', hindi: 'हिंदी', garhwali: 'गढ़वाली', kumaoni: 'कुमाऊँनी', continue: 'जारी',
    },
  },
};
