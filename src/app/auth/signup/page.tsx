'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signUp } from '@/lib/auth';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignupPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const handleSignup = async (email: string, password: string, fullName?: string) => {
    try {
      await signUp(email, password, fullName);
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      throw error; // Let AuthForm handle the error display
    }
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
          {success ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Account Created!
              </h2>
              <p className="text-muted-foreground mb-4">
                Redirecting you to login...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Create Your Account
                </h1>
                <p className="text-muted-foreground">
                  Join us and start shopping for premium hoodies
                </p>
              </div>

              <AuthForm mode="signup" onSubmit={handleSignup} />
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
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
        )}
      </div>
    </div>
  );
}
