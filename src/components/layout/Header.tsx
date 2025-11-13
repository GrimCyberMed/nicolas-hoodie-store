'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { CartIcon } from '@/components/cart/CartIcon';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-foreground hover:text-accent transition-colors">
              Nicolas Hoodie Store
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/"
              className="text-foreground hover:text-accent transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-foreground hover:text-accent transition-colors font-medium"
            >
              Products
            </Link>
            <Link
              href="/cart"
              className="text-foreground hover:text-accent transition-colors font-medium"
            >
              Cart
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <CartIcon />

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border">
            <Link
              href="/"
              className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/cart"
              className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cart
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
