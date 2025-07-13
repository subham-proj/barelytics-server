/**
 * Track an event (unauthenticated, all event types in a single table).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const trackEvent = async (req, res) => {
  const {
    project_id,
    event_type, 
    event,      
    event_name, 
    session_id,
    visitor_id,
    url,
    page_url,
    page_title,
    referrer,
    location,
    props,
    properties,
    ts,
    browser,
    device,
    country,
    country_name
  } = req.body;

  if (!project_id || !(event_type || req.body.type)) {
    return res.status(400).json({ error: 'project_id and event_type are required.' });
  }

  const type = event_type || req.body.type;
  const eventName = event_name || event;

  const insertData = {
    project_id,
    event_type: type,
    event_name: eventName,
    session_id,
    visitor_id,
    page_url: page_url || url,
    page_title,
    referrer,
    location,
    properties: properties || props,
    created_at: ts ? new Date(ts).toISOString() : undefined,
    browser,
    device,
    country,
    country_name
  };

  // Remove undefined fields
  Object.keys(insertData).forEach(key => insertData[key] === undefined && delete insertData[key]);

  const { data, error } = await req.supabaseAdmin
    .from('tracking_events')
    .insert([insertData])
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