import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yffwlcerbdkpsyulakic.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZndsY2VyYmRrcHN5dWxha2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTM0OTksImV4cCI6MjA3NjA4OTQ5OX0.jRD_DnQOzNwfk7mKkMRMLtfKIlR2qjlKV2kFtiMMPOU';

export const supabase = SUPABASE_URL !== 'YOUR_SUPABASE_URL' 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
