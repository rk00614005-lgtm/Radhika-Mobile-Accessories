import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { ToastContainer } from './components/ToastContainer.js';
import { AuthModal } from './components/AuthModal.js';
import { FloatingContactButtons } from './components/FloatingContactButtons.js';
import { HomePage } from './pages/HomePage.js';
import { ShopPage } from './pages/ShopPage.js';
import { ProductDetailsPage } from './pages/ProductDetailsPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { AccountPage } from './pages/AccountPage.js';
import { TrackOrderPage } from './pages/TrackOrderPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { FaqPage } from './pages/FaqPage.js';
import { PoliciesPage } from './pages/PoliciesPage.js';
import { GalleryPage } from './pages/GalleryPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

const AppContent: React.FC = () => {
  const { currentPage } = useShop();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'product':
        return <ProductDetailsPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'account':
        return <AccountPage />;
      case 'track':
        return <TrackOrderPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FaqPage />;
      case 'policies':
        return <PoliciesPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'admin':
        return <AdminDashboardPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-purple-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        {renderCurrentPage()}
      </main>
      <Footer />
      <ToastContainer />
      <AuthModal />
      <FloatingContactButtons />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}
