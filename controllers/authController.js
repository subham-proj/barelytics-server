import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Sign up a new user with email and password.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const signup = async (req, res) => {
  const { email, password, ...userMetadata } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: userMetadata }
  });
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({
    message: 'Signup successful. Please check your email to confirm your account.',
    user: data.user,
    session: data.session
  });
};

/**
 * Sign in a user with email and password.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  const user = data.user;
  const session = data.session;
  res.json({
    message: 'Login successful.',
    user: {
      id: user.id,
      email: user.email,
      email_confirmed: !!user.email_confirmed_at,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      user_metadata: {
        email_verified: user.user_metadata?.email_verified || false
      }
    },
    session: session && {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
      token_type: session.token_type
    }
  });
}; 