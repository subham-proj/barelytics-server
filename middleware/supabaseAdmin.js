import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

/**
 * Middleware to attach a Supabase service role client to req.supabaseService.
 * For admin operations like updating user passwords, bypassing RLS, etc.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function supabaseServiceClient(req, res, next) {
  req.supabaseService = createClient(supabaseUrl, supabaseServiceRoleKey);
  next();
}