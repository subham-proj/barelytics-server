import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

/**
 * Middleware to create a Supabase client with user authentication.
 * Extracts the Bearer token from the Authorization header and creates
 * a Supabase client with the user's access token for authenticated requests.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
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

/**
 * Creates a Supabase client instance authenticated with the given user's access token.
 * Useful for making authenticated Supabase requests on behalf of a user (e.g., after login).
 *
 * @param {string} token - The user's access token (JWT)
 * @returns {import('@supabase/supabase-js').SupabaseClient} An authenticated Supabase client instance
 */
export function customSupabaseUserClient(token) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
}