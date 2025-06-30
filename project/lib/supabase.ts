import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      venues: {
        Row: {
          id: string;
          name: string;
          address: string;
          description: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          description: string;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          description?: string;
          image_url?: string;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_time: string;
          end_time: string;
          category: 'sports' | 'shows' | 'movies';
          venue_id: string;
          max_capacity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          start_time: string;
          end_time: string;
          category: 'sports' | 'shows' | 'movies';
          venue_id: string;
          max_capacity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_time?: string;
          end_time?: string;
          category?: 'sports' | 'shows' | 'movies';
          venue_id?: string;
          max_capacity?: number;
          created_at?: string;
        };
      };
      rsvps: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
};