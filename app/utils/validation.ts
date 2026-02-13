import Joi from 'joi';

// Common validation patterns
const phonePattern = /^[+]?\d{9,15}$/;
const kenyanPhonePattern = /^(?:\+254|254|0)?[71]\d{8}$/;

// Phone number normalization for Kenyan numbers
export const normalizeKenyanPhoneNumber = (phone: string): string => {
  if (!phone) return phone;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If already in international format, return as is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Convert Kenyan numbers to international format
  if (cleaned.startsWith('0')) {
    // Convert 07... or 01... to +2547... or +2541...
    return '+254' + cleaned.substring(1);
  } else if (cleaned.startsWith('254')) {
    // Convert 254... to +254...
    return '+' + cleaned;
  } else if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
    // Handle case where user enters 712345678 or 112345678
    return '+254' + cleaned;
  }
  
  // Return as is if it doesn't match Kenyan patterns
  return phone;
};

// Validation schemas
export const signupSchema = Joi.object({
  profile_type: Joi.string().valid('household', 'househelp', 'bureau').required().messages({
    'string.empty': 'Please select your profile type',
    'any.required': 'Please select your profile type',
    'any.only': 'Please choose a valid profile type from the list'
  }),
  password: Joi.string().min(4).required().messages({
    'string.empty': 'Please enter your password',
    'string.min': 'Password must be at least 4 characters',
    'any.required': 'Please enter your password'
  }),
  first_name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Please enter your first name',
    'string.min': 'First name should be at least 2 characters',
    'string.max': 'First name is too long (max 50 characters)',
    'any.required': 'Please enter your first name'
  }),
  last_name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Please enter your last name',
    'string.min': 'Last name should be at least 2 characters',
    'string.max': 'Last name is too long (max 50 characters)',
    'any.required': 'Please enter your last name'
  }),
  phone: Joi.string().pattern(kenyanPhonePattern).required().messages({
    'string.empty': 'Please enter your phone number',
    'string.pattern.base': 'Please enter a valid Kenyan phone number (e.g., 0712345678, 0112345678, or +254712345678)',
    'any.required': 'Please enter your phone number'
  })
});

export const loginSchema = Joi.object({
  phone: Joi.string().pattern(kenyanPhonePattern).required().messages({
    'string.empty': 'Please enter your phone number',
    'string.pattern.base': 'Please enter a valid Kenyan phone number (e.g., 0712345678, 0112345678, or +254712345678)',
    'any.required': 'Please enter your phone number'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Please enter your password',
    'any.required': 'Please enter your password'
  })
});

export const otpSchema = Joi.object({
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.empty': 'Please enter your OTP code',
    'string.length': 'Please enter all 6 digits of your OTP',
    'string.pattern.base': 'OTP should only contain numbers',
    'any.required': 'Please enter your OTP code'
  })
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Please enter your current password',
    'any.required': 'Please enter your current password'
  }),
  newPassword: Joi.string().min(4).required().messages({
    'string.empty': 'Please enter your new password',
    'string.min': 'Password must be at least 4 characters',
    'any.required': 'Please enter your new password'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'string.empty': 'Please confirm your new password',
    'any.only': 'Your passwords don\'t match. Please try again',
    'any.required': 'Please confirm your new password'
  })
});

export const forgotPasswordSchema = Joi.object({
  phone: Joi.string().pattern(kenyanPhonePattern).required().messages({
    'string.empty': 'Please enter your phone number',
    'string.pattern.base': 'Please enter a valid Kenyan phone number (e.g., 0712345678, 0112345678, or +254712345678)',
    'any.required': 'Please enter your phone number'
  })
});

export const updatePhoneSchema = Joi.object({
  phone: Joi.string().pattern(kenyanPhonePattern).required().messages({
    'string.empty': 'Please enter your phone number',
    'string.pattern.base': 'Please enter a valid Kenyan phone number (e.g., 0712345678, 0112345678, or +254712345678)',
    'any.required': 'Please enter your phone number'
  })
});

export const updateEmailSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Please enter your email address',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Please enter your email address'
  })
});

// Validation function
export const validateForm = (schema: Joi.ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const errors: { [key: string]: string } = {};
    error.details.forEach((detail) => {
      const field = detail.path[0] as string;
      errors[field] = detail.message;
    });
    return { isValid: false, errors, value };
  }
  
  return { isValid: true, errors: {}, value };
};

// Real-time validation for individual fields
export const validateField = (schema: Joi.ObjectSchema, fieldName: string, value: any) => {
  const fieldSchema = schema.extract(fieldName);
  const { error } = fieldSchema.validate(value);
  
  if (error) {
    return error.details[0].message;
  }
  
  return null;
};

// Helper function to get field-specific schema
export const getFieldSchema = (schema: Joi.ObjectSchema, fieldName: string) => {
  return schema.extract(fieldName);
}; 
