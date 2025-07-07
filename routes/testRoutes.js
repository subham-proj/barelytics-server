import { Router } from 'express';
import { getTestTable } from '../controllers/testController.js';

const router = Router();

router.get('/test', getTestTable);

export default router; 