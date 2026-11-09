import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './client';
import { pullAll, resetAndPull } from './sync';
import type { UserRole } from '../../app/types/userRoles';

export interface Member {
  userId: number;
  email: string;
  name: string;
  roles: UserRole[];
}

export interface SignUpInput {
  email: string;
  password: string;
  name?: string;
  role: 'buyer' | 'seller' | 'agent';
  companyName?: string;
  country?: string;
  city?: string;
  /** Extra onboarding answers, stored on the applicant's company. */
  companyDetails?: Record<string, unknown>;
}

const DEMO_USER_KEY = 'user';

async function loadMember(): Promise<Member | null> {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('members')
    .select('user_id, email, name, roles')
    .eq('auth_user_id', user.id)
    .maybeSingle();
  if (error || !data) return null;
  return { userId: data.user_id, email: data.email, name: data.name, roles: data.roles };
}

/** Where a member lands after signing in: their most privileged dashboard. */
export function homePathFor(member: Member | null): string {
  const order: [UserRole, string][] = [
    ['system-admin', '/system-admin'],
    ['business-admin', '/business-admin'],
    ['operator', '/operator'],
    ['seller', '/seller'],
    ['agent', '/agent'],
    ['buyer', '/buyer'],
  ];
  for (const [role, path] of order) if (member?.roles.includes(role)) return path;
  return '/';
}

export async function signIn(email: string, password: string): Promise<Member | null> {
  if (!supabase) {
    // Local demo mode: no real authentication.
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify({ email }));
    return null;
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await pullAll();
  return loadMember();
}

/** Returns true when the user must confirm their email before signing in. */
export async function signUp(input: SignUpInput): Promise<{ needsConfirmation: boolean }> {
  if (!supabase) {
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify({ email: input.email }));
    return { needsConfirmation: false };
  }
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${window.location.origin}/signin`,
      data: {
        name: input.name,
        role: input.role,
        company_name: input.companyName,
        country: input.country,
        city: input.city,
        company_details: input.companyDetails,
      },
    },
  });
  if (error) throw error;
  if (data.session) await pullAll();
  return { needsConfirmation: !data.session };
}

export async function signOut() {
  localStorage.removeItem(DEMO_USER_KEY);
  if (!supabase) return;
  await supabase.auth.signOut();
  await resetAndPull();
}

export async function requestPasswordReset(email: string) {
  if (!supabase) return;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/signin`,
  });
  if (error) throw error;
}

interface AuthState {
  ready: boolean;
  session: Session | null;
  member: Member | null;
  isSignedIn: boolean;
}

const AuthContext = createContext<AuthState>({ ready: false, session: null, member: null, isSignedIn: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ ready: !isSupabaseConfigured, session: null, member: null, isSignedIn: false });

  useEffect(() => {
    if (!supabase) {
      setState({ ready: true, session: null, member: null, isSignedIn: !!localStorage.getItem(DEMO_USER_KEY) });
      return;
    }
    let active = true;
    const refresh = async (session: Session | null) => {
      const member = session ? await loadMember() : null;
      if (active) setState({ ready: true, session, member, isSignedIn: !!session });
    };
    supabase.auth.getSession().then(({ data }) => refresh(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer: Supabase recommends not awaiting other calls inside this callback.
      setTimeout(() => refresh(session), 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
