import { TABLES } from '../constants.js';

/**
 * Get user account settings (full name, email, company)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getAccountSettings = async (req, res) => {
  const { user_id } = req.query;
  const supabase = req.supabaseUser;
  if (!user_id) return res.status(400).json({ error: 'user_id is required.' });

  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('id, full_name, email, company')
    .eq('id', user_id)
    .maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'User not found.' });

  res.json({
    id: data.id,
    full_name: data.full_name,
    email: data.email,
    company: data.company
  });
};

/**
 * Update user account settings (full name, email, company)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const updateAccountSettings = async (req, res) => {
  const { user_id } = req.body;
  const { full_name, email, company } = req.body;
  const supabase = req.supabaseUser;
  if (!user_id) return res.status(400).json({ error: 'user_id is required.' });

  const { data, error } = await supabase
    .from(TABLES.USERS)
    .update({ full_name, email, company })
    .eq('id', user_id)
    .select('id, full_name, email, company')
    .maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'User not found or not updated.' });

  res.json({
    id: data.id,
    full_name: data.full_name,
    email: data.email,
    company: data.company
  });
};

/**
 * Change user password (requires current password verification)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const changePassword = async (req, res) => {
  const { user_id, email, current_password, new_password } = req.body;
  const supabaseService = req.supabaseService; 
  const supabaseAdmin = req.supabaseAdmin; 

  if (!user_id || !email || !current_password || !new_password) {
    return res.status(400).json({ error: 'user_id, email, current_password, and new_password are required.' });
  }

  const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password: current_password,
  });

  if (signInError) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const { error: updateError } = await supabaseService.auth.admin.updateUserById(user_id, {
    password: new_password,
  });

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  res.json({ message: 'Password updated successfully.' });
}; 