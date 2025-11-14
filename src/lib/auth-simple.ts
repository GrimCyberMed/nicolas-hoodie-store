import { supabase } from './supabase';

/**
 * SIMPLIFIED AUTH SYSTEM
 * No complex triggers, no RLS issues, just simple auth
 */

export interface SimpleAuthUser {
  id: string;
  email: string;
  role: 'admin' | 'customer';
}

/**
 * Sign up a new user
 */
export async function simpleSignUp(email: string, password: string, fullName?: string) {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned');

    // 2. Create user role entry (manually, no trigger)
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'customer',
      });

    // Ignore conflict errors (user might already exist)
    if (roleError && !roleError.message.includes('duplicate')) {
      console.error('Role creation error:', roleError);
    }

    return { success: true, user: authData.user };
  } catch (error: any) {
    console.error('Signup error:', error);
    throw new Error(error.message || 'Failed to create account');
  }
}

/**
 * Sign in a user
 */
export async function simpleSignIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned');

    // Get user role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .single();

    const user: SimpleAuthUser = {
      id: data.user.id,
      email: data.user.email!,
      role: roleData?.role || 'customer',
    };

    return { success: true, user, session: data.session };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Failed to login');
  }
}

/**
 * Sign out
 */
export async function simpleSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current user with role
 */
export async function getSimpleCurrentUser(): Promise<SimpleAuthUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email!,
      role: roleData?.role || 'customer',
    };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Check if user is admin
 */
export async function isSimpleAdmin(): Promise<boolean> {
  const user = await getSimpleCurrentUser();
  return user?.role === 'admin';
}
