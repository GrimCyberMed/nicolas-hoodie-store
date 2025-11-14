'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignupPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const handleSignup = async (email: string, password: string, fullName?: string) => {
    await register(email, password, fullName);
    router.push('/'); // Redirect to home after successful signup
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
              Create Your Account
            </h1>
            <p className="text-muted-foreground">
              Join us and start shopping for premium hoodies
            </p>
          </div>

          <AuthForm mode="signup" onSubmit={handleSignup} />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          By creating an account, you agree to our{' '}
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
