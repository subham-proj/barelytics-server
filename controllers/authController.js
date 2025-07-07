import supabase from '../supabaseClient.js';

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

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({
    message: 'Login successful.',
    user: data.user,
    session: data.session
  });
}; 