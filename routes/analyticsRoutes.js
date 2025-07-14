import { Router } from 'express';
import { getOverview, getTopPages, getTopReferrers, getNewVsReturning, getConversionRate, getGlobalReach, getDeviceTypes, getTopLocations, getBrowserAnalytics } from '../controllers/analyticsController.js';
import { supabaseUserClient } from '../middleware/supabaseUser.js';

const router = Router();

router.use(supabaseUserClient);

router.get('/overview', getOverview);
router.get('/top-pages', getTopPages);
router.get('/top-referrers', getTopReferrers);
router.get('/new-vs-returning', getNewVsReturning);
router.get('/conversion-rate', getConversionRate);
router.get('/global-reach', getGlobalReach);
router.get('/device-types', getDeviceTypes);
router.get('/top-locations', getTopLocations);
router.get('/browser-analytics', getBrowserAnalytics);

export default router; 