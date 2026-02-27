import { describe, it, expect } from 'vitest';
import { transformErrorMessage, extractErrorMessage, handleApiError } from '../errorMessages';

describe('errorMessages utility', () => {
  describe('transformErrorMessage', () => {
    describe('Generic Validation Errors', () => {
      it('transforms empty value error', () => {
        expect(transformErrorMessage('value is not allowed to be empty')).toBe('This field is required');
      });

      it('transforms string type error', () => {
        expect(transformErrorMessage('value must be a string')).toBe('Please enter valid text');
      });

      it('transforms number type error', () => {
        expect(transformErrorMessage('value must be a number')).toBe('Please enter a valid number');
      });

      it('transforms integer type error', () => {
        expect(transformErrorMessage('value must be an integer')).toBe('Please enter a whole number');
      });

      it('transforms email validation error', () => {
        expect(transformErrorMessage('value must be a valid email')).toBe('Please enter a valid email address');
      });

      it('transforms minimum length error', () => {
        expect(transformErrorMessage('value length must be at least 5')).toBe('This field is too short');
      });

      it('transforms maximum length error', () => {
        expect(transformErrorMessage('value length must be less than or equal to 100')).toBe('This field is too long');
      });
    });

    describe('Authentication Errors', () => {
      it('transforms empty email error', () => {
        expect(transformErrorMessage('email is not allowed to be empty')).toBe('Please enter your email address');
      });

      it('transforms empty password error', () => {
        expect(transformErrorMessage('password is not allowed to be empty')).toBe('Please enter your password');
      });

      it('transforms invalid credentials error', () => {
        expect(transformErrorMessage('Invalid email or password')).toBe('The email or password you entered is incorrect');
      });

      it('transforms invalid credentials (lowercase)', () => {
        expect(transformErrorMessage('invalid credentials')).toBe('The phone number or password you entered is incorrect');
      });

      it('transforms user not found error', () => {
        expect(transformErrorMessage('User not found')).toBe('No account found with this phone number. Please check and try again.');
      });

      it('transforms user not found (detailed)', () => {
        expect(transformErrorMessage('user with that phone number not found')).toBe('No account found with this phone number. Please check and try again.');
      });

      it('transforms Not Found error', () => {
        expect(transformErrorMessage('Not Found')).toBe('Invalid phone number or password. Please check and try again.');
      });

      it('transforms unauthorized error', () => {
        expect(transformErrorMessage('Unauthorized')).toBe('Invalid phone number or password. Please check and try again.');
      });

      it('transforms invalid password error', () => {
        expect(transformErrorMessage('invalid password')).toBe('The password you entered is incorrect. Please try again.');
      });

      it('transforms incorrect password error', () => {
        expect(transformErrorMessage('incorrect password')).toBe('The password you entered is incorrect. Please try again.');
      });

      it('transforms invalid OTP error', () => {
        expect(transformErrorMessage('Invalid OTP')).toBe('The verification code you entered is incorrect');
      });

      it('transforms expired OTP error', () => {
        expect(transformErrorMessage('OTP expired')).toBe('The verification code has expired. Please request a new one');
      });

      it('transforms invalid token error', () => {
        expect(transformErrorMessage('Invalid token')).toBe('The verification link is invalid or has expired');
      });

      it('transforms email exists error', () => {
        expect(transformErrorMessage('Email already exists')).toBe('An account with this email address already exists');
      });

      it('transforms phone exists error', () => {
        expect(transformErrorMessage('Phone number already exists')).toBe('An account with this phone number already exists');
      });

      it('transforms duplicate phone error (detailed)', () => {
        expect(transformErrorMessage('a user with the same phone number already exists')).toBe('An account with this phone number already exists. Please log in instead.');
      });

      it('transforms duplicate email error (detailed)', () => {
        expect(transformErrorMessage('a user with the same email already exists')).toBe('An account with this email address already exists. Please log in instead.');
      });

      it('transforms unverified account error', () => {
        expect(transformErrorMessage('Account not verified')).toBe('Please verify your phone number before signing in');
      });

      it('transforms password length error', () => {
        expect(transformErrorMessage('password must be at least 4 characters')).toBe('Password must be at least 4 characters');
      });
    });

    describe('Context-Specific Errors', () => {
      it('transforms gender error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'gender')).toBe('Please select your gender');
      });

      it('transforms date of birth error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'dateOfBirth')).toBe('Please select your date of birth');
      });

      it('transforms years of experience error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'yearsOfExperience')).toBe('Please select your years of experience');
      });

      it('transforms work with kids error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'workWithKids')).toBe('Please select your work preference with children');
      });

      it('transforms work with pets error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'workWithPets')).toBe('Please select your pet work preference');
      });

      it('transforms languages error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'languages')).toBe('Please select at least one language you speak');
      });

      it('transforms my kids error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'myKids')).toBe('Please select an option about having kids');
      });

      it('transforms religion error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'religion')).toBe('Please select your religion or belief system');
      });

      it('transforms bio error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'bio')).toBe('Please write a brief bio about yourself');
      });

      it('transforms salary expectations error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'salaryExpectations')).toBe('Please select a salary range');
      });

      it('transforms budget error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'budget')).toBe('Please select a budget range');
      });

      it('transforms house size error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'houseSize')).toBe('Please select your house size');
      });

      it('transforms location error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'location')).toBe('Please select your location');
      });

      it('transforms nanny type error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'nannyType')).toBe('Please select the type of househelp service');
      });

      it('transforms certifications error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'certifications')).toBe('Please add your certifications or select "None"');
      });

      it('transforms photos error with context', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'photos')).toBe('Please upload at least one photo');
      });

      it('uses context-specific error over generic error', () => {
        const result = transformErrorMessage('"value" is not allowed to be empty', 'gender');
        expect(result).toBe('Please select your gender');
        expect(result).not.toBe('This field is required');
      });
    });

    describe('Fallback Patterns', () => {
      it('handles generic "is not allowed to be empty" pattern', () => {
        expect(transformErrorMessage('custom_field is not allowed to be empty')).toBe('This field is required');
      });

      it('handles generic "is required" pattern', () => {
        expect(transformErrorMessage('field is required')).toBe('This field is required');
      });

      it('preserves descriptive "must be" messages', () => {
        expect(transformErrorMessage('value must be between 1 and 100')).toBe('value must be between 1 and 100');
      });

      it('preserves "Invalid" messages', () => {
        expect(transformErrorMessage('Invalid format for date')).toBe('Invalid format for date');
      });

      it('transforms vague "signup failed" error', () => {
        expect(transformErrorMessage('signup failed')).toBe('Something went wrong. Please try again or contact support if the problem persists.');
      });

      it('transforms vague "login failed" error', () => {
        expect(transformErrorMessage('login failed')).toBe('Something went wrong. Please try again or contact support if the problem persists.');
      });

      it('transforms vague "failed" error', () => {
        expect(transformErrorMessage('failed')).toBe('Something went wrong. Please try again or contact support if the problem persists.');
      });

      it('transforms "internal server error"', () => {
        expect(transformErrorMessage('internal server error')).toBe('Something went wrong. Please try again or contact support if the problem persists.');
      });

      it('transforms "an internal error occurred"', () => {
        expect(transformErrorMessage('an internal error occurred')).toBe('Something went wrong. Please try again or contact support if the problem persists.');
      });

      it('preserves specific error messages', () => {
        const specificError = 'The selected date is in the past';
        expect(transformErrorMessage(specificError)).toBe(specificError);
      });
    });

    describe('Edge Cases', () => {
      it('handles empty string', () => {
        expect(transformErrorMessage('')).toBe('An error occurred. Please try again.');
      });

      it('handles null', () => {
        expect(transformErrorMessage(null as any)).toBe('An error occurred. Please try again.');
      });

      it('handles undefined', () => {
        expect(transformErrorMessage(undefined as any)).toBe('An error occurred. Please try again.');
      });

      it('handles unknown context gracefully', () => {
        expect(transformErrorMessage('"value" is not allowed to be empty', 'unknownContext')).toBe('This field is required');
      });

      it('handles case-sensitive matching', () => {
        expect(transformErrorMessage('INVALID EMAIL OR PASSWORD')).toBe('INVALID EMAIL OR PASSWORD');
      });

      it('handles partial matches', () => {
        expect(transformErrorMessage('The email is not allowed to be empty')).toBe('Please enter your email address');
      });
    });
  });

  describe('extractErrorMessage', () => {
    describe('Gateway Format', () => {
      it('extracts message from gateway format', () => {
        const error = { error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } };
        expect(extractErrorMessage(error)).toBe('Invalid input');
      });

      it('handles gateway format with additional fields', () => {
        const error = { error: { code: 'AUTH_ERROR', message: 'Unauthorized', status: 401 } };
        expect(extractErrorMessage(error)).toBe('Unauthorized');
      });
    });

    describe('Legacy Format', () => {
      it('extracts message from legacy format', () => {
        const error = { message: 'Something went wrong' };
        expect(extractErrorMessage(error)).toBe('Something went wrong');
      });

      it('extracts error string from legacy format', () => {
        const error = { error: 'Invalid request' };
        expect(extractErrorMessage(error)).toBe('Invalid request');
      });
    });

    describe('String Format', () => {
      it('handles string error', () => {
        expect(extractErrorMessage('Direct error message')).toBe('Direct error message');
      });

      it('handles empty string', () => {
        expect(extractErrorMessage('')).toBe('');
      });
    });

    describe('JavaScript Error', () => {
      it('extracts message from Error object', () => {
        const error = new Error('Network error');
        expect(extractErrorMessage(error)).toBe('Network error');
      });

      it('extracts message from custom error', () => {
        const error = { message: 'Custom error', stack: 'stack trace' };
        expect(extractErrorMessage(error)).toBe('Custom error');
      });
    });

    describe('Edge Cases', () => {
      it('handles null', () => {
        expect(extractErrorMessage(null)).toBe('');
      });

      it('handles undefined', () => {
        expect(extractErrorMessage(undefined)).toBe('');
      });

      it('handles empty object', () => {
        expect(extractErrorMessage({})).toBe('');
      });

      it('handles object with no message', () => {
        expect(extractErrorMessage({ code: 'ERROR', status: 500 })).toBe('');
      });

      it('handles nested error without message', () => {
        expect(extractErrorMessage({ error: { code: 'ERROR' } })).toBe('');
      });

      it('handles number', () => {
        expect(extractErrorMessage(404)).toBe('');
      });

      it('handles boolean', () => {
        expect(extractErrorMessage(true)).toBe('');
      });

      it('handles array', () => {
        expect(extractErrorMessage(['error1', 'error2'])).toBe('');
      });
    });

    describe('Priority Order', () => {
      it('prioritizes gateway format over legacy format', () => {
        const error = { 
          error: { message: 'Gateway message' },
          message: 'Legacy message'
        };
        expect(extractErrorMessage(error)).toBe('Gateway message');
      });

      it('falls back to legacy message if gateway has no message', () => {
        const error = { 
          error: { code: 'ERROR' },
          message: 'Legacy message'
        };
        expect(extractErrorMessage(error)).toBe('Legacy message');
      });

      it('falls back to error string if no message field', () => {
        const error = { 
          error: 'Error string'
        };
        expect(extractErrorMessage(error)).toBe('Error string');
      });
    });
  });

  describe('handleApiError', () => {
    describe('Basic Functionality', () => {
      it('extracts and transforms error message', () => {
        const error = { message: 'email is not allowed to be empty' };
        expect(handleApiError(error)).toBe('Please enter your email address');
      });

      it('uses context for transformation', () => {
        const error = { message: '"value" is not allowed to be empty' };
        expect(handleApiError(error, 'gender')).toBe('Please select your gender');
      });

      it('returns fallback for empty error', () => {
        expect(handleApiError(null)).toBe('An error occurred. Please try again.');
      });

      it('uses custom fallback message', () => {
        expect(handleApiError(null, undefined, 'Custom fallback')).toBe('Custom fallback');
      });
    });

    describe('Gateway Format', () => {
      it('handles gateway error format', () => {
        const error = { error: { code: 'VALIDATION_ERROR', message: 'Invalid email or password' } };
        expect(handleApiError(error)).toBe('The email or password you entered is incorrect');
      });

      it('handles gateway error with context', () => {
        const error = { error: { message: '"value" is not allowed to be empty' } };
        expect(handleApiError(error, 'bio')).toBe('Please write a brief bio about yourself');
      });
    });

    describe('Legacy Format', () => {
      it('handles legacy error format', () => {
        const error = { message: 'User not found' };
        expect(handleApiError(error)).toBe('No account found with this phone number. Please check and try again.');
      });

      it('handles legacy error string', () => {
        const error = { error: 'Invalid OTP' };
        expect(handleApiError(error)).toBe('The verification code you entered is incorrect');
      });
    });

    describe('String Format', () => {
      it('handles string error', () => {
        expect(handleApiError('password is not allowed to be empty')).toBe('Please enter your password');
      });

      it('handles string error with context', () => {
        expect(handleApiError('"value" is not allowed to be empty', 'location')).toBe('Please select your location');
      });
    });

    describe('Edge Cases', () => {
      it('handles undefined error', () => {
        expect(handleApiError(undefined)).toBe('An error occurred. Please try again.');
      });

      it('handles null error', () => {
        expect(handleApiError(null)).toBe('An error occurred. Please try again.');
      });

      it('handles empty string error', () => {
        expect(handleApiError('')).toBe('An error occurred. Please try again.');
      });

      it('handles empty object error', () => {
        expect(handleApiError({})).toBe('An error occurred. Please try again.');
      });

      it('handles error with no extractable message', () => {
        expect(handleApiError({ code: 'ERROR', status: 500 })).toBe('An error occurred. Please try again.');
      });

      it('uses custom fallback for unextractable error', () => {
        expect(handleApiError({}, undefined, 'Network error')).toBe('Network error');
      });
    });

    describe('Integration', () => {
      it('chains extraction and transformation correctly', () => {
        const error = { error: { message: 'OTP expired' } };
        expect(handleApiError(error)).toBe('The verification code has expired. Please request a new one');
      });

      it('applies context after extraction', () => {
        const error = { message: 'required' };
        expect(handleApiError(error, 'photos')).toBe('Please upload at least one photo');
      });

      it('preserves specific messages through the chain', () => {
        const error = { message: 'The selected date must be in the future' };
        expect(handleApiError(error)).toBe('The selected date must be in the future');
      });
    });
  });
});
