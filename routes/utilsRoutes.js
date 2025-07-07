import { Router } from 'express';
import { healthCheck } from '../controllers/utilsController.js';

const router = Router();

router.get('/health', healthCheck);

export default router; 