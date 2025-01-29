'use client';
import Navbar from './components/NavBar';
import Sidebar from './components/SideBar';
import Footer from './components/Footer';
import './globals.css';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext(); // Access user and loading states
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/auth/login') {
      router.push('/auth/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    // While loading, show a placeholder or spinner
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {user && <Sidebar />} {/* Sidebar reacts to user state */}
        <main className={`flex-1 ${user ? 'ml-64' : ''} p-6 overflow-auto`}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
