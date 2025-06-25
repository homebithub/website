import { 
  signupSchema, 
  loginSchema, 
  otpSchema, 
  changePasswordSchema, 
  forgotPasswordSchema,
  validateForm 
} from './validation';

// Simple test function to verify validation schemas
export function testValidationSchemas() {
  console.log('Testing validation schemas...');

  // Test signup validation
  const validSignup = {
    profile_type: 'employer',
    password: 'TestPass123!',
    first_name: 'John',
    last_name: 'Doe',
    phone: '0712345678'
  };

  const invalidSignup = {
    profile_type: '',
    password: 'weak',
    first_name: 'J',
    last_name: '',
    phone: '123'
  };

  const signupResult = validateForm(signupSchema, validSignup);
  const signupInvalidResult = validateForm(signupSchema, invalidSignup);

  console.log('Valid signup:', signupResult.isValid);
  console.log('Invalid signup errors:', signupInvalidResult.errors);

  // Test login validation
  const validLogin = {
    phone: '0712345678',
    password: 'password123'
  };

  const invalidLogin = {
    phone: '123',
    password: ''
  };

  const loginResult = validateForm(loginSchema, validLogin);
  const loginInvalidResult = validateForm(loginSchema, invalidLogin);

  console.log('Valid login:', loginResult.isValid);
  console.log('Invalid login errors:', loginInvalidResult.errors);

  // Test OTP validation
  const validOtp = { otp: '123456' };
  const invalidOtp = { otp: '123' };

  const otpResult = validateForm(otpSchema, validOtp);
  const otpInvalidResult = validateForm(otpSchema, invalidOtp);

  console.log('Valid OTP:', otpResult.isValid);
  console.log('Invalid OTP errors:', otpInvalidResult.errors);

  // Test password change validation
  const validPasswordChange = {
    currentPassword: 'oldpass123',
    newPassword: 'NewPass123!',
    confirmPassword: 'NewPass123!'
  };

  const invalidPasswordChange = {
    currentPassword: '',
    newPassword: 'weak',
    confirmPassword: 'different'
  };

  const passwordResult = validateForm(changePasswordSchema, validPasswordChange);
  const passwordInvalidResult = validateForm(changePasswordSchema, invalidPasswordChange);

  console.log('Valid password change:', passwordResult.isValid);
  console.log('Invalid password change errors:', passwordInvalidResult.errors);

  // Test forgot password validation
  const validForgotPassword = { phone: '0712345678' };
  const invalidForgotPassword = { phone: '123' };

  const forgotResult = validateForm(forgotPasswordSchema, validForgotPassword);
  const forgotInvalidResult = validateForm(forgotPasswordSchema, invalidForgotPassword);

  console.log('Valid forgot password:', forgotResult.isValid);
  console.log('Invalid forgot password errors:', forgotInvalidResult.errors);

  return {
    signup: { valid: signupResult.isValid, invalid: signupInvalidResult.errors },
    login: { valid: loginResult.isValid, invalid: loginInvalidResult.errors },
    otp: { valid: otpResult.isValid, invalid: otpInvalidResult.errors },
    passwordChange: { valid: passwordResult.isValid, invalid: passwordInvalidResult.errors },
    forgotPassword: { valid: forgotResult.isValid, invalid: forgotInvalidResult.errors }
  };
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Only run in browser for debugging
  (window as any).testValidation = testValidationSchemas;
} 