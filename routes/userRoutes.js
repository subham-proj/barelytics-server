import { Router } from 'express';
import { getAccountSettings, updateAccountSettings } from '../controllers/userController.js';
import { supabaseUserClient } from '../middleware/supabaseUserClient.js';

const router = Router();

router.use(supabaseUserClient);

router.get('/account-settings', getAccountSettings);
router.post('/account-settings', updateAccountSettings);

export default router; 