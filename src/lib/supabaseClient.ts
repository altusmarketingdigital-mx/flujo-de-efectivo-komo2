import { createClient } from '@supabase/supabase-js';

let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fake-url.supabase.co').trim();
if (url.includes('=')) {
  url = url.split('=').pop()?.trim() || url;
}
if (!url.startsWith('http')) {
  url = 'https://' + url;
}

let key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fake-key').trim();
if (key.includes('=')) {
  key = key.split('=').pop()?.trim() || key;
}

export const supabase = createClient(url, key);
