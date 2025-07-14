import { Router } from 'express';
import { getAccountSettings, updateAccountSettings, changePassword, deleteUser } from '../controllers/userController.js';
import { supabaseUserClient } from '../middleware/supabaseUser.js';
import { supabaseServiceClient } from '../middleware/supabaseAdmin.js';

const router = Router();


router.get('/account-settings',supabaseUserClient, getAccountSettings);
router.post('/account-settings',supabaseUserClient, updateAccountSettings);
router.post('/change-password', supabaseServiceClient, changePassword);
router.post('/delete', supabaseUserClient, deleteUser);

export default router; 