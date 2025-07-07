import { Router } from 'express';
import { createProject, updateProject, deleteProject } from '../controllers/projectController.js';
import { supabaseUserClient } from '../middleware/supabaseUserClient.js';

const router = Router();

// Apply middleware to all project routes
router.use(supabaseUserClient);

router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router; 