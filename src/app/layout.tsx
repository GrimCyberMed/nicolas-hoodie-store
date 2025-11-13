import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { CartDrawer } from '@/components/cart/CartDrawer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nicolas Hoodie Store - Premium Hoodies',
  description: 'Shop the finest collection of premium hoodies with modern designs and superior comfort.',
  keywords: ['hoodies', 'sweatshirts', 'streetwear', 'fashion'],
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
          {children}
          <CartDrawer />
        </ThemeProvider>
      </body>
    </html>
  );
}
