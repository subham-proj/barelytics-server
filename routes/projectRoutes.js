import { Router } from 'express';
import { createProject, getProjects, updateProject, deleteProject, getProjectConfig, updateProjectConfig } from '../controllers/projectController.js';
import { supabaseUserClient } from '../middleware/supabaseUser.js';
import { supabaseAdminClient, supabaseServiceClient } from '../middleware/supabaseAdmin.js';

const router = Router();

router.get('/:id/config',supabaseServiceClient, getProjectConfig);

// Apply middleware to all project routes
router.use(supabaseUserClient);

router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/delete', deleteProject);

// Project configuration routes
router.put('/:id/config', updateProjectConfig);

export default router; 