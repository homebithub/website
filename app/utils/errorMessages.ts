/**
 * Transforms generic API error messages into human-readable form field errors
 */

interface FieldErrorMap {
  [key: string]: string;
}

// Map of generic error patterns to human-readable messages
const ERROR_MAPPINGS: { [key: string]: string } = {
  // Generic validation errors
  'value is not allowed to be empty': 'This field is required',
  'value must be a string': 'Please enter valid text',
  'value must be a number': 'Please enter a valid number',
  'value must be an integer': 'Please enter a whole number',
  'value must be a valid email': 'Please enter a valid email address',
  'value length must be at least': 'This field is too short',
  'value length must be less than or equal to': 'This field is too long',
  
  // Authentication-specific error mappings
  'email is not allowed to be empty': 'Please enter your email address',
  'password is not allowed to be empty': 'Please enter your password',
  'first_name is not allowed to be empty': 'Please enter your first name',
  'last_name is not allowed to be empty': 'Please enter your last name',
  'phone is not allowed to be empty': 'Please enter your phone number',
  'user_type is not allowed to be empty': 'Please select your account type',
  'otp is not allowed to be empty': 'Please enter the verification code',
  'token is not allowed to be empty': 'Please enter the verification token',
  'Invalid email or password': 'The email or password you entered is incorrect',
  'User not found': 'No account found with this email address',
  'Invalid OTP': 'The verification code you entered is incorrect',
  'OTP expired': 'The verification code has expired. Please request a new one',
  'Invalid token': 'The verification link is invalid or has expired',
  'Email already exists': 'An account with this email address already exists',
  'Phone number already exists': 'An account with this phone number already exists',
  'Account not verified': 'Please verify your email address before signing in',
  
  // Context-specific mappings for various forms
  'gender is not allowed to be empty': 'Please select your gender',
  'years_of_experience is not allowed to be empty': 'Please select your years of experience',
  'work_with_kids is not allowed to be empty': 'Please select your work preference',
  'work_with_pets is not allowed to be empty': 'Please select your pet preference',
  'languages is not allowed to be empty': 'Please select at least one language',
  'has_kids is not allowed to be empty': 'Please specify if you have children',
  'location is not allowed to be empty': 'Please enter your location',
  'nanny_type is not allowed to be empty': 'Please select a service type',
  'has_pets is not allowed to be empty': 'Please specify if you have pets',
  'number_of_children is not allowed to be empty': 'Please specify the number of children',
  'child_name is not allowed to be empty': 'Please enter the child\'s name',
  'child_age is not allowed to be empty': 'Please enter the child\'s age',
  '"date_of_birth" is not allowed to be empty': 'Please select your date of birth',
  '"can_work_with_kid" is not allowed to be empty': 'Please select your work preference with children',
  '"children_age_range" is not allowed to be empty': 'Please select at least one age range',
  '"number_of_concurrent_children" is not allowed to be empty': 'Please select how many children you can work with',
  '"can_work_with_pets" is not allowed to be empty': 'Please select your pet work preference',
  '"pet_types" is not allowed to be empty': 'Please select at least one type of pet you can work with',
  '"languages" is not allowed to be empty': 'Please select at least one language you speak',
  '"has_kids" is not allowed to be empty': 'Please select an option about having kids',
  '"needs_accommodation" is not allowed to be empty': 'Please specify if you need accommodation',
  '"religion" is not allowed to be empty': 'Please select your religion or belief system',
  '"bio" is not allowed to be empty': 'Please write a brief bio about yourself',
  '"salary_frequency" is not allowed to be empty': 'Please select a salary frequency',
  '"salary_range" is not allowed to be empty': 'Please select a salary range',
  '"budget_frequency" is not allowed to be empty': 'Please select a payment frequency',
  '"budget_range" is not allowed to be empty': 'Please select a budget range',
  '"house_size" is not allowed to be empty': 'Please select your house size',
  '"location" is not allowed to be empty': 'Please select your location',
  '"availability" is not allowed to be empty': 'Please set your availability',
  '"available_from" is not allowed to be empty': 'Please select when you are available from',
  '"service_type" is not allowed to be empty': 'Please select the type of househelp service',
  '"certifications" is not allowed to be empty': 'Please add your certifications or select "None"',
  '"photos" is not allowed to be empty': 'Please upload at least one photo',
};

// Context-specific error messages based on component/form context
const CONTEXT_SPECIFIC_ERRORS: { [context: string]: FieldErrorMap } = {
  gender: {
    '"value" is not allowed to be empty': 'Please select your gender',
    'required': 'Please select your gender'
  },
  dateOfBirth: {
    '"value" is not allowed to be empty': 'Please select your date of birth',
    'required': 'Please select your date of birth'
  },
  yearsOfExperience: {
    '"value" is not allowed to be empty': 'Please select your years of experience',
    'required': 'Please select your years of experience'
  },
  workWithKids: {
    '"value" is not allowed to be empty': 'Please select your work preference with children',
    'required': 'Please select your work preference with children'
  },
  workWithPets: {
    '"value" is not allowed to be empty': 'Please select your pet work preference',
    'required': 'Please select your pet work preference'
  },
  languages: {
    '"value" is not allowed to be empty': 'Please select at least one language you speak',
    'required': 'Please select at least one language you speak'
  },
  myKids: {
    '"value" is not allowed to be empty': 'Please select an option about having kids',
    'required': 'Please select an option about having kids'
  },
  religion: {
    '"value" is not allowed to be empty': 'Please select your religion or belief system',
    'required': 'Please select your religion or belief system'
  },
  bio: {
    '"value" is not allowed to be empty': 'Please write a brief bio about yourself',
    'required': 'Please write a brief bio about yourself'
  },
  salaryExpectations: {
    '"value" is not allowed to be empty': 'Please select a salary range',
    'required': 'Please select a salary range'
  },
  budget: {
    '"value" is not allowed to be empty': 'Please select a budget range',
    'required': 'Please select a budget range'
  },
  houseSize: {
    '"value" is not allowed to be empty': 'Please select your house size',
    'required': 'Please select your house size'
  },
  location: {
    '"value" is not allowed to be empty': 'Please select your location',
    'required': 'Please select your location'
  },
  nannyType: {
    '"value" is not allowed to be empty': 'Please select the type of househelp service',
    'required': 'Please select the type of househelp service'
  },
  certifications: {
    '"value" is not allowed to be empty': 'Please add your certifications or select "None"',
    'required': 'Please add your certifications or select "None"'
  },
  photos: {
    '"value" is not allowed to be empty': 'Please upload at least one photo',
    'required': 'Please upload at least one photo'
  }
};

/**
 * Transforms a generic API error message into a human-readable message
 * @param errorMessage - The original error message from the API
 * @param context - Optional context to provide more specific error messages
 * @returns Human-readable error message
 */
export function transformErrorMessage(errorMessage: string, context?: string): string {
  if (!errorMessage) return 'An error occurred. Please try again.';

  // First check context-specific errors if context is provided
  if (context && CONTEXT_SPECIFIC_ERRORS[context]) {
    const contextErrors = CONTEXT_SPECIFIC_ERRORS[context];
    for (const [pattern, replacement] of Object.entries(contextErrors)) {
      if (errorMessage.includes(pattern)) {
        return replacement;
      }
    }
  }

  // Then check general error transformations
  for (const [pattern, replacement] of Object.entries(ERROR_MAPPINGS)) {
    if (errorMessage.includes(pattern)) {
      return replacement;
    }
  }

  // Handle validation error patterns
  if (errorMessage.includes('is not allowed to be empty')) {
    return 'This field is required';
  }

  if (errorMessage.includes('is required')) {
    return 'This field is required';
  }

  if (errorMessage.includes('must be')) {
    return errorMessage; // Keep validation messages that are already descriptive
  }

  if (errorMessage.includes('Invalid')) {
    return errorMessage; // Keep invalid format messages
  }

  // Return original message if no transformation is found but make it more user-friendly
  if (errorMessage.toLowerCase().includes('failed')) {
    return 'Unable to save your information. Please try again.';
  }

  return errorMessage;
}

/**
 * Transforms API error response into user-friendly message
 * @param error - Error object or string from API response
 * @param context - Optional context for more specific error messages
 * @param fallbackMessage - Fallback message if transformation fails
 * @returns Human-readable error message
 */
export function handleApiError(
  error: any, 
  context?: string, 
  fallbackMessage: string = 'An error occurred. Please try again.'
): string {
  let errorMessage = '';

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (error?.error) {
    errorMessage = error.error;
  } else {
    return fallbackMessage;
  }

  return transformErrorMessage(errorMessage, context);
}
