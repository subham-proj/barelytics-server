export const createProject = async (req, res) => {
  const { name, description } = req.body;
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
  const { data, error } = await supabase
    .from('projects')
    .insert([{ name, description, user_id: user.id }])
    .select()
    .maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(500).json({ error: 'Failed to create project.' });
  res.status(201).json(data);
};

export const updateProject = async (req, res) => {
  const { id } = req.params;
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
  
  
  const { data, error } = await supabase
    .from('projects')
    .update({ name, description, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Project not found or not owned by user.' });
  res.json(data);
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;
  const supabase = req.supabaseUser;
  if (!id) return res.status(400).json({ error: 'Project id is required.' });
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Project deleted successfully.' });
}; 