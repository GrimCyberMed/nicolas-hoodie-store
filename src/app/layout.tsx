import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { CartDrawer } from '@/components/cart/CartDrawer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nicolas Hoodie Store - Premium Hoodies',
  description: 'Shop the finest collection of premium hoodies with modern designs and superior comfort.',
  keywords: ['hoodies', 'sweatshirts', 'streetwear', 'fashion'],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <CartDrawer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
