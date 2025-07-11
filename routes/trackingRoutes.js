import { Router } from 'express';
import { trackEvent, getEvents } from '../controllers/trackingController.js';
import { supabaseAdminClient } from '../middleware/supabaseAdminClient.js';

const router = Router();

// Attach admin client for unauthenticated event tracking
router.use(supabaseAdminClient);

router.post('/track', trackEvent);
router.get('/track', getEvents);

export default router; 