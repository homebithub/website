import Joi from 'joi';

// Common validation patterns
const phonePattern = /^[+]?\d{9,15}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Validation schemas
export const signupSchema = Joi.object({
  profile_type: Joi.string().valid('employer', 'househelp', 'bureau').required().messages({
    'any.required': 'Please select your profile type',
    'any.only': 'Please choose a valid profile type from the list'
  }),
  password: Joi.string().pattern(passwordPattern).required().messages({
    'string.pattern.base': 'Your password needs at least 8 characters with uppercase, lowercase, number, and special character',
    'any.required': 'Please enter your password'
  }),
  first_name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name should be at least 2 characters',
    'string.max': 'First name is too long (max 50 characters)',
    'any.required': 'Please enter your first name'
  }),
  last_name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name should be at least 2 characters',
    'string.max': 'Last name is too long (max 50 characters)',
    'any.required': 'Please enter your last name'
  }),
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'Please enter a valid phone number (e.g., 0712345678)',
    'any.required': 'Please enter your phone number'
  })
});

export const loginSchema = Joi.object({
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'Please enter a valid phone number (e.g., 0712345678)',
    'any.required': 'Please enter your phone number'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Please enter your password'
  })
});

export const otpSchema = Joi.object({
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.length': 'Please enter all 6 digits of your OTP',
    'string.pattern.base': 'OTP should only contain numbers',
    'any.required': 'Please enter your OTP code'
  })
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Please enter your current password'
  }),
  newPassword: Joi.string().pattern(passwordPattern).required().messages({
    'string.pattern.base': 'Your new password needs at least 8 characters with uppercase, lowercase, number, and special character',
    'any.required': 'Please enter your new password'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Your passwords don\'t match. Please try again',
    'any.required': 'Please confirm your new password'
  })
});

export const forgotPasswordSchema = Joi.object({
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'Please enter a valid phone number (e.g., 0712345678)',
    'any.required': 'Please enter your phone number'
  })
});

export const updatePhoneSchema = Joi.object({
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'Please enter a valid phone number (e.g., 0712345678)',
    'any.required': 'Please enter your phone number'
  })
});

export const updateEmailSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
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