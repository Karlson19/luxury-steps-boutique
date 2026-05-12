import { Metadata } from 'next';
import AdminInstallBanner from '@/components/ui/AdminInstallBanner';

// This overrides the global metadata JUST for the /admin pages
// so the browser knows to treat it as a separate PWA!
export const metadata: Metadata = {
  title: 'Luxury Steps Admin Console',
  description: 'Manage your Luxury Steps Boutique store',
  manifest: '/admin-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Luxury Steps Admin',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AdminInstallBanner />
    </>
  );
}
