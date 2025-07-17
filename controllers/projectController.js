import { TABLES, MAX_PROJECTS_PER_USER } from '../constants.js';

/**
 * Get all projects for the authenticated user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getProjects = async (req, res) => {
  const supabase = req.supabaseUser;
  
  // Get user_id from JWT
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid or expired access token.' });
  }
  
  const { data, error } = await supabase
    .from(TABLES.PROJECTS)
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
    
  if (error) return res.status(400).json({ error: error.message });
  res.json(data || []);
};

/**
 * Get the configuration for a specific project for the authenticated user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getProjectConfig = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Project id is required.' });
  
  const { data, error } = await req.supabaseService
    .from(TABLES.PROJECT_CONFIGS)
    .select('*')
    .eq('project_id', id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Project configuration not found.' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  res.json(data);
};

/**
 * Update or create the configuration for a specific project for the authenticated user.
 * Accepts individual config columns in the request body.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const updateProjectConfig = async (req, res) => {
  const { id } = req.params;
  const configData = req.body;
  const supabase = req.supabaseUser;
  if (!id) return res.status(400).json({ error: 'Project id is required.' });
  if (!configData || Object.keys(configData).length === 0) {
    return res.status(400).json({ error: 'Configuration data is required.' });
  }
  
  // Get user_id from JWT
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid or expired access token.' });
  }
  
  // Check if config exists
  const { data: existingConfig } = await supabase
    .from(TABLES.PROJECT_CONFIGS)
    .select('id')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .single();
  
  let result;
  if (existingConfig) {
    // Update existing config with individual columns
    const updateData = {
      ...configData,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from(TABLES.PROJECT_CONFIGS)
      .update(updateData)
      .eq('project_id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) return res.status(400).json({ error: error.message });
    result = data;
  } else {
    // Create new config with individual columns
    const insertData = {
      project_id: id,
      user_id: user.id,
      ...configData
    };
    
    const { data, error } = await supabase
      .from(TABLES.PROJECT_CONFIGS)
      .insert([insertData])
      .select()
      .single();
    
    if (error) return res.status(400).json({ error: error.message });
    result = data;
  }
  
  res.json(result);
};

/**
 * Create a new project for the authenticated user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const createProject = async (req, res) => {
  const { name, description, website } = req.body;
  const supabase = req.supabaseUser;
  // Get user_id from JWT
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid or expired access token.' });
  }
  if (!name) {
    return res.status(400).json({ error: 'Project name is required.' });
  }

  // Project Limit Check
  const { data: userProjects, error: countError } = await supabase
    .from(TABLES.PROJECTS)
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_active', true);
  if (countError) {
    return res.status(500).json({ error: 'Failed to check user projects.' });
  }
  if (userProjects && userProjects.length >= MAX_PROJECTS_PER_USER) {
    return res.status(400).json({ error: `Limit reached. You can only create up to ${MAX_PROJECTS_PER_USER} projects.` });
  }

  const { data, error } = await supabase
    .from(TABLES.PROJECTS)
    .insert([{ name, description, website: website, user_id: user.id }])
    .select()
    .maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(500).json({ error: 'Failed to create project.' });
  res.status(201).json(data);
};

/**
 * Update a project for the authenticated user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const updateProject = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const { name, description } = req.body;
  const supabase = req.supabaseUser;
  if (!id) return res.status(400).json({ error: 'Project id is required.' });
  
  // Get user_id from JWT
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid or expired access token.' });
  }
  
  // Select query to check if project exists
  const { data: existingProject, error: selectError } = await supabase
    .from(TABLES.PROJECTS)
    .select('*')
    .eq('id', id)
    .single();
  
  console.log('Select query result:', { existingProject, selectError, user: user.id });
  
  const { data, error } = await supabase
    .from(TABLES.PROJECTS)
    .update({ name, description, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Project not found or not owned by user.' });
  res.json(data);
};

/**
 * Soft delete a project (set is_active=false)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const deleteProject = async (req, res) => {
  const { project_id } = req.body;
  const supabase = req.supabaseUser;
  if (!project_id) return res.status(400).json({ error: 'project_id is required.' });

  const { data, error } = await supabase
    .from('projects')
    .update({ is_active: false })
    .eq('id', project_id)
    .select('id, is_active')
    .maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Project not found or not updated.' });

  res.json({ id: data.id, is_active: data.is_active });
}; 