import { format, formatDistanceToNow, differenceInHours, differenceInMinutes } from "date-fns";

/**
 * Formats a date intelligently based on how long ago it was
 * 
 * For times less than 24 hours:
 * - Shows time in HH:MM format
 * - Shows "X minutes/hours ago" below
 * 
 * For times more than 24 hours:
 * - Shows full date (08 Oct 2025)
 * - Shows time (11:56 PM)
 * 
 * @param {Date|string|number} date - The date to format
 * @param {object} options - Formatting options
 * @param {boolean} options.showAgo - Whether to show "ago" suffix (default: true)
 * @param {boolean} options.showFullDate - Force full date display (default: false)
 * 
 * @returns {object} Object with display, subtext, and isRecent properties
 * 
 * @example
 * formatDateWithAgo(new Date()) // { display: "11:56 PM", subtext: "just now", isRecent: true }
 * formatDateWithAgo(new Date(Date.now() - 30 * 60 * 1000)) // { display: "11:26 PM", subtext: "30m ago", isRecent: true }
 * formatDateWithAgo(new Date(Date.now() - 25 * 60 * 60 * 1000)) // { display: "07 Oct 2025", subtext: "10:56 PM", isRecent: false }
 */
export const formatDateWithAgo = (date, options = {}) => {
  const {
    showAgo = true,
    showFullDate = false,
  } = options;

  if (!date) {
    return { display: "N/A", subtext: "", isRecent: false };
  }

  const dateObj = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return { display: "Invalid Date", subtext: "", isRecent: false };
  }

  const now = new Date();
  const hoursDiff = differenceInHours(now, dateObj);
  const minutesDiff = differenceInMinutes(now, dateObj);
  
  const isRecent = hoursDiff < 24 && !showFullDate;

  if (isRecent) {
    // For recent times (less than 24 hours)
    const displayTime = format(dateObj, "hh:mm a");
    let agoText = "";

    if (minutesDiff < 1) {
      agoText = "just now";
    } else if (minutesDiff < 60) {
      agoText = showAgo ? `${minutesDiff}m ago` : `${minutesDiff}m`;
    } else {
      const hours = Math.floor(minutesDiff / 60);
      agoText = showAgo ? `${hours}h ago` : `${hours}h`;
    }

    return {
      display: displayTime,
      subtext: agoText,
      isRecent: true,
    };
  } else {
    // For older times (24+ hours)
    const displayDate = format(dateObj, "dd MMM yyyy");
    const displayTime = format(dateObj, "hh:mm a");

    return {
      display: displayDate,
      subtext: displayTime,
      isRecent: false,
    };
  }
};

/**
 * Formats a date with relative time using formatDistanceToNow
 * 
 * @param {Date|string|number} date - The date to format
 * @returns {string} Formatted string like "2 hours ago", "3 days ago"
 * 
 * @example
 * formatRelativeTime(new Date()) // "less than a minute ago"
 * formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)) // "2 hours ago"
 */
export const formatRelativeTime = (date) => {
  if (!date) return "N/A";
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "Invalid Date";
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Formats a date in short compact format
 * 
 * @param {Date|string|number} date - The date to format
 * @returns {string} Formatted string like "10m", "2h", "3d"
 * 
 * @example
 * formatCompactTime(new Date()) // "0m"
 * formatCompactTime(new Date(Date.now() - 30 * 60 * 1000)) // "30m"
 * formatCompactTime(new Date(Date.now() - 25 * 60 * 60 * 1000)) // "1d"
 */
export const formatCompactTime = (date) => {
  if (!date) return "N/A";
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "Invalid";
  
  const now = new Date();
  const minutesDiff = differenceInMinutes(now, dateObj);
  
  if (minutesDiff < 60) {
    return `${minutesDiff}m`;
  } else if (minutesDiff < 1440) { // Less than 24 hours
    return `${Math.floor(minutesDiff / 60)}h`;
  } else {
    return `${Math.floor(minutesDiff / 1440)}d`;
  }
};

/**
 * Formats a date in standard format: "dd MMM yyyy, hh:mm a"
 * 
 * @param {Date|string|number} date - The date to format
 * @returns {string} Formatted string like "08 Oct 2025, 11:56 PM"
 * 
 * @example
 * formatStandardDate(new Date()) // "08 Oct 2025, 11:56 PM"
 */
export const formatStandardDate = (date) => {
  if (!date) return "N/A";
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "Invalid Date";
  
  return format(dateObj, "dd MMM yyyy, hh:mm a");
};

/**
 * Formats a date for display in a table or list
 * Returns an object suitable for rendering in two lines
 * 
 * @param {Date|string|number} date - The date to format
 * @returns {object} Object with date and time properties
 * 
 * @example
 * formatTableDate(new Date()) // { date: "08 Oct 2025", time: "11:56 PM" }
 */
export const formatTableDate = (date) => {
  if (!date) return { date: "N/A", time: "" };
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return { date: "Invalid Date", time: "" };
  
  return {
    date: format(dateObj, "dd MMM yyyy"),
    time: format(dateObj, "hh:mm a"),
  };
};

