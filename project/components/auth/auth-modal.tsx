'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Successfully signed in!');
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1000);
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Account created! Please check your email to verify your account.');
          setTimeout(() => {
            onClose();
            resetForm();
          }, 2000);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
      // Note: User will be redirected to Google, so we don't close the modal here
    } catch (err) {
      setError('Failed to sign in with Google');
    }
    
    setGoogleLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#0B0B0E] border border-white/10 rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl">
        {/* Close Button */}
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-semibold font-space-grotesk tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Join WatchTogether'}
          </h2>
          <p className="text-white/60 mt-2">
            {mode === 'login' 
              ? 'Sign in to RSVP for events and reserve tables' 
              : 'Create an account to start joining watch parties'
            }
          </p>
        </div>

        {/* Google Sign In Button */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 rounded-full transition mb-6 flex items-center justify-center gap-3"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#0B0B0E] text-white/60">or</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="pl-10 bg-white/5 border-white/10 focus:border-emerald-400 focus:ring-emerald-400"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-emerald-400 focus:ring-emerald-400"
                required
              />
              <Button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-white/40" />
                ) : (
                  <Eye className="w-4 h-4 text-white/40" />
                )}
              </Button>
            </div>
          </div>

          {/* Confirm Password (Signup only) */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 bg-white/5 border-white/10 focus:border-emerald-400 focus:ring-emerald-400"
                  required
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-full transition"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        {/* Switch Mode */}
        <div className="text-center mt-6">
          <p className="text-white/60">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <Button
            onClick={switchMode}
            className="text-emerald-400 hover:text-emerald-300 font-medium mt-1"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </Button>
        </div>
      </div>
    </div>
  );
}