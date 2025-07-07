import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export function supabaseUserClient(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No or invalid Authorization header' });
  }
  const userAccessToken = authHeader.split(' ')[1];
  if (!userAccessToken) {
    return res.status(401).json({ error: 'No access token provided' });
  }
  req.supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${userAccessToken}` } }
  });
  next();
} 