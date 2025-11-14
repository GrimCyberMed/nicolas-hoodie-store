'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { AuthForm } from '@/components/auth/AuthForm';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    router.push('/'); // Redirect to home after successful login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center space-x-3 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo.svg" 
              alt="Nicolas Hoodie Store Logo" 
              width={60} 
              height={60}
              className="w-15 h-15"
            />
            <span className="text-2xl font-bold text-foreground">
              Nicolas Hoodie Store
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue shopping
            </p>
          </div>

          <AuthForm mode="login" onSubmit={handleLogin} />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-accent hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
