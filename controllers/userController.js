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
 * Change user password (requires admin privileges)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const changePassword = async (req, res) => {
  const { user_id, new_password } = req.body;
  const supabaseService = req.supabaseService;

  if (!user_id || !new_password) {
    return res.status(400).json({ error: 'user_id and new_password are required.' });
  }

  const { data, error } = await supabaseService.auth.admin.updateUserById(user_id, {
    password: new_password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Password updated successfully.' });
}; 