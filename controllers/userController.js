import { PLANS, TABLES } from '../constants.js';
import { triggerUpgrade } from '../services/paymentService.js';

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

/**
 * Soft delete a user (set is_active=false)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const deleteUser = async (req, res) => {
  const { user_id } = req.body;
  const supabase = req.supabaseUser;
  if (!user_id) return res.status(400).json({ error: 'user_id is required.' });

  const { data, error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', user_id)
    .select('id, is_active')
    .maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'User not found or not updated.' });

  res.json({ id: data.id, is_active: data.is_active });
}; 

/**
 * Get the current user's subscription plan.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getPlan = async (req, res) => {
  const supabase = req.supabaseUser;
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid or expired access token.' });
  }
  
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('plan')
    .eq('id', user.id)
    .maybeSingle(); 
  if (error) return res.status(400).json({ error: error.message });
  res.json({ plan: data.plan || 'free' });
};

/**
 * Update the current user's subscription plan (upgrade/downgrade).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const updatePlan = async (req, res) => {
  const { plan } = req.body;
  const validPlans = PLANS.map(p => p.key);
  if (!plan || !validPlans.includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan.' });
  }
  const supabase = req.supabaseUser;
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid or expired access token.' });
  }
  // Update user plan (assume users table has a plan column)
  const { data, error } = await supabase
    .from('users')
    .update({ plan })
    .eq('id', user.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: `Plan updated to ${plan}.`, plan });
}; 

/**
 * Initiate a payment flow for upgrading the user's plan (stub).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const initiateUpgrade = async (req, res) => {
  const { plan } = req.body;
  const validPlans = PLANS.map(p => p.key);
  if (!plan || !validPlans.includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan.' });
  }
  const supabase = req.supabaseUser;
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid or expired access token.' });
  }
  const result = await triggerUpgrade(user.id, plan);
  res.json(result);
}; 