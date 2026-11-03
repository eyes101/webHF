// App.jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import PageTitleManager from './components/PageTitleManager';
import HomePage from './pages/HomePage';
import './globals.css';

// Route-level code splitting: the homepage loads immediately; every other
// page is downloaded only when a visitor actually navigates to it. This
// keeps the first load fast instead of shipping all 20+ pages up front.
const ShopPage = lazy(() => import('./pages/ShopPage'));
const BestSellersPage = lazy(() => import('./pages/BestSellersPage'));
const NewArrivalsPage = lazy(() => import('./pages/NewArrivalsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const KitchensPage = lazy(() => import('./pages/KitchensPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const ArtisansPage = lazy(() => import('./pages/ArtisansPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
const StaffLoginPage = lazy(() => import('./pages/StaffLoginPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ShippingPolicyPage = lazy(() => import('./pages/PolicyPages').then((m) => ({ default: m.ShippingPolicyPage })));
const ReturnsPolicyPage = lazy(() => import('./pages/PolicyPages').then((m) => ({ default: m.ReturnsPolicyPage })));
const TermsPage = lazy(() => import('./pages/PolicyPages').then((m) => ({ default: m.TermsPage })));

function ProtectedRoute({ children, staffOnly }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--steel)' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        Authenticating...
      </div>
    );
  }

  if (!user) {
    if (staffOnly) {
      return <Navigate to="/staff/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (staffOnly && user.role !== 'staff' && user.role !== 'admin') {
    return <Navigate to="/staff/login" replace />;
  }

  return children;
}

function PageFallback() {
  return (
    <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--steel)' }}>
      <div className="spinner" style={{ margin: '0 auto 16px' }} />
      Loading page…
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products" element={<ShopPage />} />
          <Route path="/best-sellers" element={<BestSellersPage />} />
          <Route path="/new-arrivals" element={<NewArrivalsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about-us" element={<Navigate to="/about" replace />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/track-order" element={<Navigate to="/track" replace />} />
          <Route path="/kitchens" element={<KitchensPage />} />
          <Route path="/modular-kitchens" element={<Navigate to="/kitchens" replace />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/artisans" element={<ArtisansPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute staffOnly><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff/login" element={<StaffLoginPage />} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="/returns-policy" element={<ReturnsPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <PageTitleManager />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
