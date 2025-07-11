/**
 * Track an event (unauthenticated, all event types in a single table).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const trackEvent = async (req, res) => {
  const {
    project_id,
    event_type
  } = req.body;

  if (!project_id || !event_type) {
    return res.status(400).json({ error: 'project_id and event_type are required.' });
  }

  // Insert into tracking_events table
  const { data, error } = await req.supabaseAdmin
    .from('tracking_events')
    .insert([req.body])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

/**
 * Get all tracking events for a given project_id.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getEvents = async (req, res) => {
  const { project_id } = req.query;
  if (!project_id) {
    return res.status(400).json({ error: 'project_id is required as a query parameter.' });
  }
  const { data, error } = await req.supabaseAdmin
    .from('tracking_events')
    .select('*')
    .eq('project_id', project_id)
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data || []);
}; 