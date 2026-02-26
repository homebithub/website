/**
 * Mock data for testing
 */

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  profile_type: 'household',
  subscription: {
    status: 'active',
    has_access: true,
    is_trial: false,
    is_early_adopter: false,
    days_remaining: 30,
    expires_at: '2026-03-26T00:00:00Z',
  },
};

export const mockTrialUser = {
  ...mockUser,
  subscription: {
    status: 'trial',
    has_access: true,
    is_trial: true,
    is_early_adopter: false,
    days_remaining: 25,
    expires_at: '2026-03-23T00:00:00Z',
  },
};

export const mockExpiredUser = {
  ...mockUser,
  subscription: {
    status: 'suspended',
    has_access: false,
    is_trial: false,
    is_early_adopter: false,
    days_remaining: 0,
    expires_at: '2026-02-20T00:00:00Z',
  },
};

export const mockHousehelpProfile = {
  id: 'profile-123',
  user_id: 'user-123',
  first_name: 'Jane',
  last_name: 'Doe',
  phone: '+254712345678',
  location: 'Nairobi',
  years_of_experience: 5,
  salary_expectation: 25000,
  bio: 'Experienced househelp',
  profile_type: 'househelp',
};

export const mockHouseholdProfile = {
  id: 'profile-456',
  user_id: 'user-456',
  household_name: 'Smith Family',
  location: 'Nairobi',
  house_size: 'large',
  number_of_kids: 2,
  has_pets: true,
  budget: 30000,
  profile_type: 'household',
};

export const mockConversation = {
  id: 'conv-123',
  participants: [
    { id: 'user-123', name: 'Test User' },
    { id: 'user-456', name: 'Other User' },
  ],
  last_message: {
    id: 'msg-123',
    content: 'Hello, are you available?',
    sender_id: 'user-456',
    created_at: '2026-02-26T10:00:00Z',
  },
  unread_count: 2,
};

export const mockHireRequest = {
  id: 'hire-123',
  household_id: 'profile-456',
  househelp_id: 'profile-123',
  status: 'pending',
  message: 'We would like to hire you',
  created_at: '2026-02-26T10:00:00Z',
};

export const mockSubscriptionPlan = {
  id: 'plan-123',
  name: 'Monthly Plan',
  price: 999,
  currency: 'KES',
  interval: 'month',
  features: [
    'Unlimited messaging',
    'Advanced search',
    'Profile verification',
  ],
};
