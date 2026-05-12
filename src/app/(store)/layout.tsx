import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import WhatsAppFloating from '@/components/layout/WhatsAppFloating';
import BottomNav from '@/components/layout/BottomNav';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      {/* pb accounts for bottom nav height (3.5rem) + safe area on mobile only */}
      <main className="pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        {children}
      </main>
      <Footer />
      <WhatsAppFloating />
      <BottomNav />
    </>
  );
}
