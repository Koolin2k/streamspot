import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umlymccdsfccvwmzepye.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbHltY2Nkc2ZjY3Z3bXplcHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzUzNDgsImV4cCI6MjA2NjgxMTM0OH0.au9B0FKb7oAerudXW8716oQbkbbw4EygzU4uKUnIixw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
