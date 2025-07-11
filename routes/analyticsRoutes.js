import { Router } from 'express';
import { getOverview, getTopPages, getTopReferrers } from '../controllers/analyticsController.js';
import { supabaseUserClient } from '../middleware/supabaseUserClient.js';

const router = Router();

router.use(supabaseUserClient);

router.get('/overview', getOverview);
router.get('/top-pages', getTopPages);
router.get('/top-referrers', getTopReferrers);

export default router; 