import { TABLES } from '../constants.js';
import { getMonthRanges, toISOString } from '../utils/dateHelpers.js';

/**
 * Get analytics overview for a project (authenticated), including % change from last month.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getOverview = async (req, res) => {
  const { project_id } = req.query;
  const supabase = req.supabaseUser;
  if (!project_id) return res.status(400).json({ error: 'project_id is required.' });

  // Get current and previous calendar month ranges
  const { current, previous } = getMonthRanges();
  const currentFrom = current.from;
  const currentTo = current.to;
  const prevFrom = previous.from;
  const prevTo = previous.to;

  // --- Total Visitors ---
  // Current month
  const { count: curr_visitors } = await supabase
    .from(TABLES.TRACKING_EVENTS)
    .select('visitor_id', { count: 'exact', head: true })
    .eq('project_id', project_id)
    .eq('event_type', 'page_view')
    .neq('visitor_id', null)
    .gte('created_at', toISOString(currentFrom))
    .lte('created_at', toISOString(currentTo))
    .maybeSingle();
  // Previous month
  const { count: prev_visitors } = await supabase
    .from(TABLES.TRACKING_EVENTS)
    .select('visitor_id', { count: 'exact', head: true })
    .eq('project_id', project_id)
    .eq('event_type', 'page_view')
    .neq('visitor_id', null)
    .gte('created_at', toISOString(prevFrom))
    .lte('created_at', toISOString(prevTo))
    .maybeSingle();

  const prevVisitorsCount = prev_visitors || 0;
  const currVisitorsCount = curr_visitors || 0;
  let visitors_percent;
  if (prevVisitorsCount === 0) {
    visitors_percent = currVisitorsCount === 0 ? 0 : 100;
  } else {
    visitors_percent = ((currVisitorsCount - prevVisitorsCount) / prevVisitorsCount) * 100;
  }

  // --- Page Views ---
  // Current month
  const { count: curr_page_views } = await supabase
    .from(TABLES.TRACKING_EVENTS)
    .select('*', { count: 'exact', head: true })
    .eq('project_id', project_id)
    .eq('event_type', 'page_view')
    .gte('created_at', toISOString(currentFrom))
    .lte('created_at', toISOString(currentTo))
    .maybeSingle();
  // Previous month
  const { count: prev_page_views } = await supabase
    .from(TABLES.TRACKING_EVENTS)
    .select('*', { count: 'exact', head: true })
    .eq('project_id', project_id)
    .eq('event_type', 'page_view')
    .gte('created_at', toISOString(prevFrom))
    .lte('created_at', toISOString(prevTo))
    .maybeSingle();

  const prevPageViewsCount = prev_page_views || 0;
  const currPageViewsCount = curr_page_views || 0;
  let page_views_percent;
  if (prevPageViewsCount === 0) {
    page_views_percent = currPageViewsCount === 0 ? 0 : 100;
  } else {
    page_views_percent = ((currPageViewsCount - prevPageViewsCount) / prevPageViewsCount) * 100;
  }

  // --- Placeholders for other metrics ---
  const avg_session = null;
  const bounce_rate = null;

  res.json({
    total_visitors: {
      value: currVisitorsCount,
      percent_change: visitors_percent
    },
    page_views: {
      value: currPageViewsCount,
      percent_change: page_views_percent
    },
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