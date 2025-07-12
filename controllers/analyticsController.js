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

  // --- Average Session Duration (Using session_id) ---
  // Get all page views for current month with session_id and timestamp
  const { data: current_events } = await supabase
    .from(TABLES.TRACKING_EVENTS)
    .select('session_id, created_at')
    .eq('project_id', project_id)
    .eq('event_type', 'page_view')
    .not('session_id', 'is', null)
    .gte('created_at', toISOString(currentFrom))
    .lte('created_at', toISOString(currentTo))
    .order('session_id')
    .order('created_at');

  // Calculate session durations for current month
  let avg_session_duration = 0;
  if (current_events && current_events.length > 0) {
    const sessionGroups = {};
    
    // Group events by session_id
    current_events.forEach(event => {
      if (!sessionGroups[event.session_id]) {
        sessionGroups[event.session_id] = [];
      }
      sessionGroups[event.session_id].push(new Date(event.created_at));
    });

    // Calculate session duration for each session (time between first and last page view)
    const sessionDurations = Object.values(sessionGroups).map(sessions => {
      if (sessions.length === 1) return 0; // Single page view = 0 duration
      
      const sortedSessions = sessions.sort((a, b) => a - b);
      const firstView = sortedSessions[0];
      const lastView = sortedSessions[sortedSessions.length - 1];
      
      return (lastView - firstView) / (1000 * 60); // Convert to minutes
    }).filter(duration => duration > 0); // Only count sessions with multiple page views

    if (sessionDurations.length > 0) {
      avg_session_duration = sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length;
    }
  }

  // Previous month session duration
  const { data: prev_events } = await supabase
    .from(TABLES.TRACKING_EVENTS)
    .select('session_id, created_at')
    .eq('project_id', project_id)
    .eq('event_type', 'page_view')
    .not('session_id', 'is', null)
    .gte('created_at', toISOString(prevFrom))
    .lte('created_at', toISOString(prevTo))
    .order('session_id')
    .order('created_at');

  let prev_avg_session_duration = 0;
  if (prev_events && prev_events.length > 0) {
    const prevSessionGroups = {};
    
    prev_events.forEach(event => {
      if (!prevSessionGroups[event.session_id]) {
        prevSessionGroups[event.session_id] = [];
      }
      prevSessionGroups[event.session_id].push(new Date(event.created_at));
    });

    const prevSessionDurations = Object.values(prevSessionGroups).map(sessions => {
      if (sessions.length === 1) return 0;
      
      const sortedSessions = sessions.sort((a, b) => a - b);
      const firstView = sortedSessions[0];
      const lastView = sortedSessions[sortedSessions.length - 1];
      
      return (lastView - firstView) / (1000 * 60);
    }).filter(duration => duration > 0);

    if (prevSessionDurations.length > 0) {
      prev_avg_session_duration = prevSessionDurations.reduce((sum, duration) => sum + duration, 0) / prevSessionDurations.length;
    }
  }

  let avg_session_percent;
  if (prev_avg_session_duration === 0) {
    avg_session_percent = avg_session_duration === 0 ? 0 : 100;
  } else {
    avg_session_percent = ((avg_session_duration - prev_avg_session_duration) / prev_avg_session_duration) * 100;
  }

  // --- Bounce Rate ---
  // Count visitors with only 1 page view
  const visitorCounts = {};
  if (current_events) {
    current_events.forEach(event => {
      visitorCounts[event.visitor_id] = (visitorCounts[event.visitor_id] || 0) + 1;
    });
  }
  
  const bouncedVisitors = Object.values(visitorCounts).filter(count => count === 1).length;
  const totalVisitors = Object.keys(visitorCounts).length;
  const bounce_rate = totalVisitors > 0 ? (bouncedVisitors / totalVisitors) * 100 : 0;

  // Previous month bounce rate
  const prevVisitorCounts = {};
  if (prev_events) {
    prev_events.forEach(event => {
      prevVisitorCounts[event.visitor_id] = (prevVisitorCounts[event.visitor_id] || 0) + 1;
    });
  }
  
  const prevBouncedVisitors = Object.values(prevVisitorCounts).filter(count => count === 1).length;
  const prevTotalVisitors = Object.keys(prevVisitorCounts).length;
  const prev_bounce_rate = prevTotalVisitors > 0 ? (prevBouncedVisitors / prevTotalVisitors) * 100 : 0;

  let bounce_rate_percent;
  if (prev_bounce_rate === 0) {
    bounce_rate_percent = bounce_rate === 0 ? 0 : 100;
  } else {
    bounce_rate_percent = ((bounce_rate - prev_bounce_rate) / prev_bounce_rate) * 100;
  }

  res.json({
    total_visitors: {
      value: currVisitorsCount,
      percent_change: visitors_percent
    },
    page_views: {
      value: currPageViewsCount,
      percent_change: page_views_percent
    },
    avg_session_duration: {
      value: Math.round(avg_session_duration * 100) / 100, // Round to 2 decimal places
      percent_change: Math.round(avg_session_percent * 100) / 100
    },
    bounce_rate: {
      value: Math.round(bounce_rate * 100) / 100, // Round to 2 decimal places
      percent_change: Math.round(bounce_rate_percent * 100) / 100
    }
  });
};

/**
 * Get top pages for a project using a dedicated Postgres function (scalable).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getTopPages = async (req, res) => {
  const { project_id, from, to, limit = 5 } = req.query;
  const supabase = req.supabaseUser;
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
  const supabase = req.supabaseUser;
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