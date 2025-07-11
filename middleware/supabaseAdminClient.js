import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

/**
 * Middleware to attach a Supabase admin client (no user token) to req.supabaseAdmin.
 * For unauthenticated event tracking.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function supabaseAdminClient(req, res, next) {
  req.supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);
  next();
} 