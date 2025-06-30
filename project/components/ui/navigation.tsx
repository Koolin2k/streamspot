'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, MapPin, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/auth-modal';
import { UserMenu } from '@/components/ui/user-menu';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/tonight', icon: Calendar, label: 'Tonight' },
  { href: '/venues', icon: MapPin, label: 'Venues' },
];

export function Navigation() {
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  // Hide navigation on admin and dashboard pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard') || pathname?.startsWith('/auth')) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-[#0B0B0E]/80 backdrop-blur border border-white/10 rounded-full px-6 py-3 shadow-lg">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-space-grotesk font-semibold text-white">WatchTogether</span>
            </Link>

            {/* Nav Items */}
            <div className="flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="w-8 h-8 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
              ) : user ? (
                <UserMenu />
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-[#0B0B0E]/90 backdrop-blur border-t border-white/10 px-4 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? 'text-emerald-400'
                      : 'text-white/70'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Auth/Profile Button */}
            {loading ? (
              <div className="flex flex-col items-center gap-1 px-3 py-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
                <span className="text-xs font-medium text-white/70">Loading</span>
              </div>
            ) : user ? (
              <Link
                href="/dashboard"
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                  pathname === '/dashboard'
                    ? 'text-emerald-400'
                    : 'text-white/70'
                }`}
              >
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile"
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span className="text-xs font-medium">Profile</span>
              </Link>
            ) : (
              <Button
                onClick={() => setShowAuthModal(true)}
                className="flex flex-col items-center gap-1 px-3 py-2 text-white/70"
              >
                <User className="w-5 h-5" />
                <span className="text-xs font-medium">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}