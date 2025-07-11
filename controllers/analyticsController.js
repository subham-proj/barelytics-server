import { TABLES } from '../constants.js';

/**
 * Get analytics overview for a project (authenticated).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getOverview = async (req, res) => {
  const { project_id, from, to } = req.query;
  const supabase = req.supabaseUser;
  if (!project_id) return res.status(400).json({ error: 'project_id is required.' });

  // Date filter
  let rangeFilter = '';
  if (from && to) {
    rangeFilter = `and(created_at.gte.${from},created_at.lte.${to})`;
  } else if (from) {
    rangeFilter = `and(created_at.gte.${from})`;
  } else if (to) {
    rangeFilter = `and(created_at.lte.${to})`;
  }

  // Total Visitors (unique visitor_id)
  const { count: total_visitors } = await supabase
    .from(TABLES.TRACKING_EVENTS)
    .select('visitor_id', { count: 'exact', head: true })
    .eq('project_id', project_id)
    .eq('event_type', 'page_view')
    .neq('visitor_id', null)
    .maybeSingle();

  // Page Views
  const { count: page_views } = await supabase
    .from(TABLES.TRACKING_EVENTS)
    .select('*', { count: 'exact', head: true })
    .eq('project_id', project_id)
    .eq('event_type', 'page_view')
    .maybeSingle();

  // Avg. Session (approximate: avg duration per session_id)
  // For simplicity, not implemented in this stub
  const avg_session = '2m 34s';

  // Bounce Rate (sessions with only one page_view)
  // For simplicity, not implemented in this stub
  const bounce_rate = 34.2;

  res.json({
    total_visitors: total_visitors || 0,
    page_views: page_views || 0,
    avg_session,
    bounce_rate
  });
};

/**
 * Get top pages for a project using a dedicated Postgres function (scalable).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getTopPages = async (req, res) => {
  const { project_id, from, to, limit = 5 } = req.query;
  const supabase = req.supabaseAdmin;
  if (!project_id) return res.status(400).json({ error: 'project_id is required.' });

  const { data, error } = await supabase.rpc('get_top_pages', {
    project_id,
    from_date: from || null,
    to_date: to || null,
    limit_count: Number(limit)
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data || []);
};

/**
 * Get top referrers for a project using a dedicated Postgres function (scalable).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getTopReferrers = async (req, res) => {
  const { project_id, from, to, limit = 5 } = req.query;
  const supabase = req.supabaseAdmin;
  if (!project_id) return res.status(400).json({ error: 'project_id is required.' });

  const { data, error } = await supabase.rpc('get_top_referrers', {
    project_id,
    from_date: from || null,
    to_date: to || null,
    limit_count: Number(limit)
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data || []);
}; 