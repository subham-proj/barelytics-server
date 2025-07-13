import { TABLES } from '../constants.js';
import { getMonthRanges, toISOString, getPreviousPeriod } from '../utils/dateHelpers.js';

/**
 * Parse and validate date ranges from request parameters
 * @param {string} from - Start date in YYYY-MM-DD format
 * @param {string} to - End date in YYYY-MM-DD format
 * @returns {Object} Object containing current and previous date ranges
 */
const parseDateRanges = (from, to) => {
  let currentFrom, currentTo, prevFrom, prevTo;
  
  if (from && to) {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(from) || !dateRegex.test(to)) {
      throw new Error('Date format must be YYYY-MM-DD');
    }
    
    currentFrom = new Date(from + 'T00:00:00.000Z');
    currentTo = new Date(to + 'T23:59:59.999Z');
    
    if (currentFrom >= currentTo) {
      throw new Error('From date must be before to date');
    }
    
    // Calculate previous period of same duration
    const previousPeriod = getPreviousPeriod(currentFrom, currentTo);
    prevFrom = previousPeriod.from;
    prevTo = previousPeriod.to;
  } else {
    // Use current and previous calendar month ranges
    const { current, previous } = getMonthRanges();
    currentFrom = current.from;
    currentTo = current.to;
    prevFrom = previous.from;
    prevTo = previous.to;
  }
  
  return { currentFrom, currentTo, prevFrom, prevTo };
};

/**
 * Get unique visitor counts for current and previous periods
 * @param {Object} supabase - Supabase client
 * @param {string} project_id - Project ID
 * @param {Date} currentFrom - Current period start date
 * @param {Date} currentTo - Current period end date
 * @param {Date} prevFrom - Previous period start date
 * @param {Date} prevTo - Previous period end date
 * @returns {Object} Object containing current and previous visitor counts
 */
const getVisitorCounts = async (supabase, project_id, currentFrom, currentTo, prevFrom, prevTo) => {
  const { data: current_visitor_data } = await supabase
    .from(TABLES.TRACKING_EVENTS)
    .select('visitor_id')
    .eq('project_id', project_id)
    .eq('event_type', 'page_view')
    .neq('visitor_id', null)
    .gte('created_at', toISOString(currentFrom))
    .lte('created_at', toISOString(currentTo));
  
  const { data: prev_visitor_data } = await supabase
    .from(TABLES.TRACKING_EVENTS)
    .select('visitor_id')
    .eq('project_id', project_id)
    .eq('event_type', 'page_view')
    .neq('visitor_id', null)
    .gte('created_at', toISOString(prevFrom))
    .lte('created_at', toISOString(prevTo));
  
  const currVisitorsCount = current_visitor_data ? new Set(current_visitor_data.map(v => v.visitor_id)).size : 0;
  const prevVisitorsCount = prev_visitor_data ? new Set(prev_visitor_data.map(v => v.visitor_id)).size : 0;
  
  return { currVisitorsCount, prevVisitorsCount };
};

/**
 * Get page view counts for current and previous periods
 * @param {Object} supabase - Supabase client
 * @param {string} project_id - Project ID
 * @param {Date} currentFrom - Current period start date
 * @param {Date} currentTo - Current period end date
 * @param {Date} prevFrom - Previous period start date
 * @param {Date} prevTo - Previous period end date
 * @returns {Object} Object containing current and previous page view counts
 */
const getPageViewCounts = async (supabase, project_id, currentFrom, currentTo, prevFrom, prevTo) => {
  const { data: current_page_views_data } = await supabase
    .from(TABLES.TRACKING_EVENTS)
    .select('*')
    .eq('project_id', project_id)
    .eq('event_type', 'page_view')
    .gte('created_at', toISOString(currentFrom))
    .lte('created_at', toISOString(currentTo));
  
  const { data: prev_page_views_data } = await supabase
    .from(TABLES.TRACKING_EVENTS)
    .select('*')
    .eq('project_id', project_id)
    .eq('event_type', 'page_view')
    .gte('created_at', toISOString(prevFrom))
    .lte('created_at', toISOString(prevTo));
  
  const currPageViewsCount = current_page_views_data?.length || 0;
  const prevPageViewsCount = prev_page_views_data?.length || 0;
  
  return { currPageViewsCount, prevPageViewsCount };
};

/**
 * Calculate average session duration from events data
 * @param {Array} events - Array of tracking events
 * @returns {number} Average session duration in minutes
 */
const calculateAverageSessionDuration = (events) => {
  if (!events || events.length === 0) return 0;
  
  const sessionGroups = {};
  events.forEach(event => {
    if (!sessionGroups[event.session_id]) {
      sessionGroups[event.session_id] = [];
    }
    sessionGroups[event.session_id].push(new Date(event.created_at));
  });
  
  const sessionDurations = Object.values(sessionGroups).map(sessions => {
    if (sessions.length === 1) return 0;
    const sortedSessions = sessions.sort((a, b) => a - b);
    const firstView = sortedSessions[0];
    const lastView = sortedSessions[sortedSessions.length - 1];
    return (lastView - firstView) / (1000 * 60);
  }).filter(duration => duration > 0);
  
  if (sessionDurations.length === 0) return 0;
  return sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length;
};

/**
 * Get session duration data for current and previous periods
 * @param {Object} supabase - Supabase client
 * @param {string} project_id - Project ID
 * @param {Date} currentFrom - Current period start date
 * @param {Date} currentTo - Current period end date
 * @param {Date} prevFrom - Previous period start date
 * @param {Date} prevTo - Previous period end date
 * @returns {Object} Object containing current and previous session durations
 */
const getSessionDurations = async (supabase, project_id, currentFrom, currentTo, prevFrom, prevTo) => {
  const { data: current_events } = await supabase
    .from(TABLES.TRACKING_EVENTS)
    .select('session_id, visitor_id, created_at')
    .eq('project_id', project_id)
    .eq('event_type', 'page_view')
    .not('session_id', 'is', null)
    .gte('created_at', toISOString(currentFrom))
    .lte('created_at', toISOString(currentTo))
    .order('session_id')
    .order('created_at');
  
  const { data: prev_events } = await supabase
    .from(TABLES.TRACKING_EVENTS)
    .select('session_id, visitor_id, created_at')
    .eq('project_id', project_id)
    .eq('event_type', 'page_view')
    .not('session_id', 'is', null)
    .gte('created_at', toISOString(prevFrom))
    .lte('created_at', toISOString(prevTo))
    .order('session_id')
    .order('created_at');
  
  const avg_session_duration = calculateAverageSessionDuration(current_events);
  const prev_avg_session_duration = calculateAverageSessionDuration(prev_events);
  
  return { avg_session_duration, prev_avg_session_duration, current_events, prev_events };
};

/**
 * Calculate bounce rate from events data
 * @param {Array} events - Array of tracking events
 * @returns {number} Bounce rate percentage
 */
const calculateBounceRate = (events) => {
  if (!events || events.length === 0) return 0;
  
  const visitorCounts = {};
  events.forEach(event => {
    visitorCounts[event.visitor_id] = (visitorCounts[event.visitor_id] || 0) + 1;
  });
  
  const bouncedVisitors = Object.values(visitorCounts).filter(count => count === 1).length;
  const totalVisitors = Object.keys(visitorCounts).length;
  
  return totalVisitors > 0 ? (bouncedVisitors / totalVisitors) * 100 : 0;
};

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
};

/**
 * Get analytics overview for a project (authenticated), including % change from previous period.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getOverview = async (req, res) => {
  const { project_id, from, to } = req.query;
  const supabase = req.supabaseUser;
  
  if (!project_id) {
    return res.status(400).json({ error: 'project_id is required.' });
  }

  try {
    // Parse and validate date ranges
    const { currentFrom, currentTo, prevFrom, prevTo } = parseDateRanges(from, to);
    
    // Get visitor counts
    const { currVisitorsCount, prevVisitorsCount } = await getVisitorCounts(
      supabase, project_id, currentFrom, currentTo, prevFrom, prevTo
    );
    
    // Get page view counts
    const { currPageViewsCount, prevPageViewsCount } = await getPageViewCounts(
      supabase, project_id, currentFrom, currentTo, prevFrom, prevTo
    );
    
    // Get session duration data
    const { avg_session_duration, prev_avg_session_duration, current_events, prev_events } = await getSessionDurations(
      supabase, project_id, currentFrom, currentTo, prevFrom, prevTo
    );
    
    // Calculate bounce rates
    const bounce_rate = calculateBounceRate(current_events);
    const prev_bounce_rate = calculateBounceRate(prev_events);
    
    // Calculate percentage changes
    const visitors_percent = calculatePercentageChange(currVisitorsCount, prevVisitorsCount);
    const page_views_percent = calculatePercentageChange(currPageViewsCount, prevPageViewsCount);
    const avg_session_percent = calculatePercentageChange(avg_session_duration, prev_avg_session_duration);
    const bounce_rate_percent = calculatePercentageChange(bounce_rate, prev_bounce_rate);

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
        value: Math.round(avg_session_duration * 100) / 100,
        percent_change: Math.round(avg_session_percent * 100) / 100
      },
      bounce_rate: {
        value: Math.round(bounce_rate * 100) / 100,
        percent_change: Math.round(bounce_rate_percent * 100) / 100
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
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