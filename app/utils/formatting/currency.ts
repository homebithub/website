/**
 * Currency and Date Formatting Utilities
 * 
 * Helper functions for formatting currency amounts and dates.
 */

/**
 * Format currency amount (cents to currency units)
 * @param amount Amount in cents
 * @param currency Currency code (default: KES)
 * @returns Formatted currency string (e.g., "KES 1,234.56")
 */
export const formatCurrency = (amount: number, currency: string = 'KES'): string => {
  // Amount is in cents, convert to currency units
  const value = amount / 100;
  
  return `${currency} ${value.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format date to readable string
 * @param dateString ISO date string
 * @returns Formatted date (e.g., "Feb 25, 2026")
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format date and time to readable string
 * @param dateString ISO date string
 * @returns Formatted date and time (e.g., "Feb 25, 2026, 10:30 AM")
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return dateString;
  }
};

/**
 * Calculate resume date based on duration
 * @param durationDays Number of days to pause
 * @returns ISO date string for resume date
 */
export const calculateResumeDate = (durationDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + durationDays);
  return date.toISOString();
};

/**
 * Calculate days between two dates
 * @param startDate Start date string
 * @param endDate End date string
 * @returns Number of days between dates
 */
export const calculateDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Format relative time (e.g., "2 days ago", "in 5 days")
 * @param dateString ISO date string
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `in ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return dateString;
  }
};

/**
 * Format billing cycle to readable string
 * @param cycle Billing cycle (month, year, etc.)
 * @returns Formatted string (e.g., "Monthly", "Yearly")
 */
export const formatBillingCycle = (cycle: string): string => {
  const cycles: Record<string, string> = {
    month: 'Monthly',
    year: 'Yearly',
    week: 'Weekly',
    day: 'Daily',
  };
  
  return cycles[cycle.toLowerCase()] || cycle;
};
