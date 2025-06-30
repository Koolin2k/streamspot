'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error during auth callback:', error);
          router.push('/');
          return;
        }

        if (data.session) {
          // Redirect to dashboard after successful authentication
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        router.push('/');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B0B0E] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">Completing sign in...</p>
      </div>
    </div>
  );
}