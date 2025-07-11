import { Router } from 'express';
import { createProject, getProjects, updateProject, deleteProject, getProjectConfig, updateProjectConfig } from '../controllers/projectController.js';
import { supabaseUserClient } from '../middleware/supabaseUserClient.js';

const router = Router();

// Apply middleware to all project routes
router.use(supabaseUserClient);

router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

// Project configuration routes
router.get('/:id/config', getProjectConfig);
router.put('/:id/config', updateProjectConfig);

export default router; 