import { PLANS } from '../constants.js';

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

  // Enforce page view limit for authenticated users
  if ((event_type || req.body.type) === 'page_view' && req.user) {
    const supabase = req.supabaseUser;
    // Get user_id from JWT
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();
    if (!userError && user) {
      const userPlan = user.plan || 'free';
      const plan = PLANS.find(p => p.key === userPlan);
      // Count user's page views for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { data: pageViews, error: pageViewsError } = await supabase
        .from('tracking_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('event_type', 'page_view')
        .gte('created_at', startOfMonth.toISOString());
      if (pageViewsError) return res.status(400).json({ error: pageViewsError.message });
      const pageViewCount = pageViews?.length || 0;
      if (plan && plan.pageViews && pageViewCount >= plan.pageViews) {
        return res.status(403).json({ error: `Your plan allows up to ${plan.pageViews} page views per month. Upgrade your plan to track more.` });
      }
    }
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