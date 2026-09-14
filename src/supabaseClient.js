import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ||  'https://cualyjuskarjjprsaxfz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1Z3HDHv2k8vDGEG2q7VMDg_IuDwSx80';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
