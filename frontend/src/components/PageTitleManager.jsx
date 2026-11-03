// components/PageTitleManager.jsx
// Sets a proper page title and meta description for every route, so browser
// tabs, search results, and shared links describe the page the customer is
// actually on (instead of every page showing the homepage title).
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE = 'Halfcon';

const PAGES = {
  '/': ['Home Care, Maintenance & Electronics Sales', 'Halfcon: home care & maintenance services, verified artisans with escrow protection, and genuine electronics — Lagos.'],
  '/shop': ['Shop Products', 'Shop genuine appliances, solar & power, cooling, plumbing and decor materials at Halfcon.'],
  '/products': ['Shop Products', 'Shop genuine appliances, solar & power, cooling, plumbing and decor materials at Halfcon.'],
  '/best-sellers': ['Best Sellers', 'Halfcon’s most popular appliances and home-care products.'],
  '/new-arrivals': ['New Arrivals', 'The latest appliances and home-care products newly in stock at Halfcon.'],
  '/about': ['About Us', 'About Halfcon — home care, maintenance and electronics sales with outlets in Ikorodu and Alaba, Lagos.'],
  '/contact': ['Contact Us', 'Contact Halfcon: WhatsApp, phone, email, and our Ikorodu and Alaba outlets in Lagos.'],
  '/faq': ['FAQ & Help', 'Answers about Halfcon orders, payments, escrow protection, delivery and artisan hiring.'],
  '/track': ['Track Your Order', 'Track your Halfcon order with your Order ID — no sign-in needed.'],
  '/kitchens': ['Modular Kitchens', 'Custom modular kitchens by Halfcon: get an instant estimate and book a free site visit.'],
  '/services': ['Services Catalog', 'Book verified home-care and maintenance services in Lagos — electrical, plumbing, carpentry, building maintenance and logistics.'],
  '/service-finder': ['Service Finder', 'Describe your problem and get matched to the right Halfcon service or artisan.'],
  '/artisans': ['Hire Verified Artisans', 'Hire verified artisans with escrow protection — pay in milestones, release only when you approve the work.'],
  '/cart': ['Your Cart', 'Review your Halfcon cart before checkout.'],
  '/checkout': ['Checkout', 'Secure Halfcon checkout via Paystack.'],
  '/orders': ['My Orders', 'Your Halfcon orders and their status.'],
  '/staff': ['Staff Dashboard', 'Halfcon staff dashboard.'],
  '/staff/login': ['Staff Sign In', 'Halfcon staff sign in.'],
  '/settings': ['Account Settings', 'Manage your Halfcon account settings.'],
  '/login': ['Sign In', 'Sign in to your Halfcon account.'],
  '/register': ['Create Account', 'Create your Halfcon account to book services and track orders.'],
  '/shipping-policy': ['Shipping & Delivery Policy', 'How Halfcon delivers products and schedules services across Lagos, plus pickup from our Ikorodu and Alaba outlets.'],
  '/returns-policy': ['Returns & Refund Policy', 'Halfcon returns, exchanges and refunds for defective products and unsatisfactory service work.'],
  '/terms': ['Terms & Conditions', 'The terms that govern Halfcon services, orders, payments and escrow artisan hiring.'],
};

function matchFor(pathname) {
  if (PAGES[pathname]) return PAGES[pathname];
  if (pathname.startsWith('/services/')) return ['Service Details', 'Details, pricing and booking for this Halfcon service.'];
  if (pathname.startsWith('/products/')) return ['Product Details', 'Details and pricing for this Halfcon product.'];
  if (pathname.startsWith('/orders/')) return ['Order Details', 'Details and status of your Halfcon order.'];
  return null;
}

export default function PageTitleManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const match = matchFor(pathname);
    document.title = match ? `${match[0]} — ${SITE}` : `${SITE} — Home Care, Maintenance & Electronics Sales`;
    if (match) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', match[1]);
    }
  }, [pathname]);

  return null;
}
