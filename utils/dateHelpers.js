/**
 * Date utility functions for analytics and reporting
 */

/**
 * Get current and previous calendar month date ranges
 * @returns {Object} Object containing current and previous month date ranges
 */
export const getMonthRanges = () => {
  const now = new Date();
  
  // Current month
  const currentFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  // Previous month
  const prevFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevTo = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  
  return {
    current: { from: currentFrom, to: currentTo },
    previous: { from: prevFrom, to: prevTo }
  };
};

/**
 * Convert date to ISO string for database queries
 * @param {Date} date - Date object to convert
 * @returns {string} ISO string representation
 */
export const toISOString = (date) => date.toISOString();

/**
 * Get date ranges for a specific month and year
 * @param {number} year - Year (e.g., 2024)
 * @param {number} month - Month (0-11, where 0 is January)
 * @returns {Object} Object containing from and to dates for the specified month
 */
export const getMonthRange = (year, month) => {
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0, 23, 59, 59, 999);
  
  return { from, to };
};

/**
 * Get date ranges for the last N months
 * @param {number} months - Number of months to go back
 * @returns {Array} Array of date range objects
 */
export const getLastNMonths = (months) => {
  const ranges = [];
  const now = new Date();
  
  for (let i = 0; i < months; i++) {
    const month = now.getMonth() - i;
    const year = now.getFullYear() + Math.floor(month / 12);
    const adjustedMonth = ((month % 12) + 12) % 12;
    
    const from = new Date(year, adjustedMonth, 1);
    const to = new Date(year, adjustedMonth + 1, 0, 23, 59, 59, 999);
    
    ranges.push({ from, to });
  }
  
  return ranges;
};

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string (e.g., "January 2024")
 */
export const formatMonthYear = (date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });
}; 