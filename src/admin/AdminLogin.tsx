import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { signInAdmin } from '../lib/supabase';

interface AdminLoginProps {
  onSuccess: (user: any, adminRecord: any) => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToSite }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsUnauthorized(false);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signInAdmin(email.trim(), password);

      if (result.error) {
        if (result.error.toLowerCase().includes('not authorized')) {
          setIsUnauthorized(true);
        } else {
          setErrorMessage(result.error);
        }
        setIsLoading(false);
        return;
      }

      if (result.user && result.adminUser) {
        onSuccess(result.user, result.adminUser);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0D10] text-[#F5F3EF] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#C8A35F]/30 selection:text-[#F5F3EF]">
      {/* Back to public website button */}
      <div className="w-full max-w-md mb-6">
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#B4B1A8] hover:text-[#C8A35F] transition-colors py-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to public website</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-[#141519] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#C8A35F]/10 border border-[#C8A35F]/20 flex items-center justify-center text-[#C8A35F] mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F5F3EF]">
            Agency Administration
          </h1>
          <p className="text-xs text-[#B4B1A8]">
            Sign in with your authorized administrator credentials.
          </p>
        </div>

        {/* Not Authorized Alert */}
        {isUnauthorized && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-red-200">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-red-300">Access Denied: Not authorized</p>
              <p className="text-red-200/80 leading-relaxed">
                Your account is authenticated, but you are not registered in the <code>admin_users</code> authorization table. You have been automatically signed out.
              </p>
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {errorMessage && !isUnauthorized && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3 text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/90 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Sign In Form (Strictly No Public Sign-up) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#B4B1A8] mb-1.5 font-mono uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#B4B1A8]/60">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@addisluxuryrealty.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-sm text-[#F5F3EF] placeholder-[#B4B1A8]/40 focus:outline-none focus:border-[#C8A35F] focus:ring-1 focus:ring-[#C8A35F] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#B4B1A8] mb-1.5 font-mono uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#B4B1A8]/60">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#0C0D10] border border-white/10 rounded-lg text-sm text-[#F5F3EF] placeholder-[#B4B1A8]/40 focus:outline-none focus:border-[#C8A35F] focus:ring-1 focus:ring-[#C8A35F] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-semibold text-[#0C0D10] bg-[#C8A35F] hover:bg-[#DEC07E] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] shadow-lg shadow-[#C8A35F]/20 mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0C0D10] border-t-transparent rounded-full animate-spin" />
                <span>Verifying credentials & admin_users...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-white/5">
          <p className="text-[11px] text-[#B4B1A8]/60">
            Authorization strictly enforced via <code>admin_users</code> table & Supabase RLS.
            Public sign-up is disabled.
          </p>
        </div>
      </div>
    </div>
  );
};
