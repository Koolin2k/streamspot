'use client';

import { useState } from 'react';
import { User, LogOut, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    router.push('/');
  };

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg"
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={displayName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-emerald-400" />
          </div>
        )}
        <span className="hidden sm:block text-sm font-medium">{displayName}</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-[#0B0B0E] border border-white/10 rounded-xl shadow-lg z-50">
            <div className="p-3 border-b border-white/10">
              <p className="font-medium text-sm">{displayName}</p>
              <p className="text-xs text-white/60">{user.email}</p>
            </div>
            
            <div className="p-1">
              <Button
                onClick={() => {
                  router.push('/dashboard');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/10 rounded-lg text-sm"
              >
                <Calendar className="w-4 h-4" />
                Dashboard
              </Button>
              
              <Button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/10 rounded-lg text-sm"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              
              <hr className="my-1 border-white/10" />
              
              <Button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-red-500/10 text-red-400 rounded-lg text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}