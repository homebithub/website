/**
 * Payment and Subscription Validation Utilities
 * 
 * Client-side validation functions for payment methods and subscription management.
 */

/**
 * Format phone number to Kenyan format (+254XXXXXXXXX)
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all spaces and special characters except +
  phone = phone.replace(/[^\d+]/g, '');
  
  // Add +254 prefix if needed
  if (phone.startsWith('+254')) return phone;
  if (phone.startsWith('254')) return `+${phone}`;
  if (phone.startsWith('0')) return `+254${phone.slice(1)}`;
  if (phone.startsWith('7') || phone.startsWith('1')) return `+254${phone}`;
  
  return phone;
};

/**
 * Validate Kenyan phone number
 * Pattern: +254[17]XXXXXXXX
 */
export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) {
    return 'Phone number is required';
  }
  
  // Format phone number
  const formatted = formatPhoneNumber(phone);
  
  // Validate Kenyan phone number pattern
  const pattern = /^\+254[17]\d{8}$/;
  if (!pattern.test(formatted)) {
    return 'Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)';
  }
  
  return null;
};

/**
 * Validate payment method nickname
 */
export const validateNickname = (nickname: string): string | null => {
  if (!nickname) {
    return null; // Nickname is optional
  }
  
  if (nickname.trim().length === 0) {
    return 'Nickname cannot be empty';
  }
  
  if (nickname.length > 50) {
    return 'Nickname must be 50 characters or less';
  }
  
  return null;
};

/**
 * Validate pause duration (7-90 days)
 */
export const validatePauseDuration = (days: number): string | null => {
  if (!days || isNaN(days)) {
    return 'Please select a pause duration';
  }
  
  if (days < 7 || days > 90) {
    return 'Pause duration must be between 7 and 90 days';
  }
  
  return null;
};

/**
 * Validate pause reason
 */
export const validatePauseReason = (reason: string): string | null => {
  if (!reason) {
    return 'Please select a reason for pausing';
  }
  
  const validReasons = ['vacation', 'financial', 'not_using', 'other'];
  if (!validReasons.includes(reason)) {
    return 'Please select a valid reason';
  }
  
  return null;
};

/**
 * Validate cancel reason
 */
export const validateCancelReason = (reason: string): string | null => {
  if (!reason) {
    return 'Please select a reason for cancellation';
  }
  
  const validReasons = ['price', 'features', 'not_using', 'found_alternative', 'other'];
  if (!validReasons.includes(reason)) {
    return 'Please select a valid reason';
  }
  
  return null;
};

/**
 * Validate feedback text
 */
export const validateFeedback = (feedback: string): string | null => {
  if (!feedback) {
    return null; // Feedback is optional
  }
  
  if (feedback.length > 500) {
    return 'Feedback must be 500 characters or less';
  }
  
  return null;
};

/**
 * Validate UUID format
 */
export const validateUUID = (id: string): string | null => {
  if (!id) {
    return 'ID is required';
  }
  
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(id)) {
    return 'Invalid ID format';
  }
  
  return null;
};

/**
 * Mask phone number for display
 * Example: +254712345678 → +254****5678
 */
export const maskPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  const formatted = formatPhoneNumber(phone);
  if (formatted.length < 8) return formatted;
  
  // Show first 4 digits (+254) and last 4 digits
  return `${formatted.slice(0, 4)}****${formatted.slice(-4)}`;
};

/**
 * Mask card number for display
 * Example: 4242424242424242 → ****4242
 */
export const maskCardNumber = (last4: string): string => {
  if (!last4) return '';
  return `****${last4}`;
};
