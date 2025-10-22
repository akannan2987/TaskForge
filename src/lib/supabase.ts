import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: 'active' | 'completed';
          priority: 'low' | 'medium' | 'high';
          due_date: string | null;
          created_at: string;
          user_id: string;
          ai_generated: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: 'active' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          created_at?: string;
          user_id: string;
          ai_generated?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: 'active' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          created_at?: string;
          user_id?: string;
          ai_generated?: boolean;
        };
      };
    };
  };
};