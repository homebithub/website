// Test utility for navigation logic
export function testNavigationLogic() {
  console.log('Testing navigation logic...');

  const authenticatedRoutes = ['/dashboard', '/profile', '/settings', '/change-password'];
  
  // Test cases
  const testCases = [
    { user: null, pathname: '/', expected: true, description: 'No user on home page' },
    { user: null, pathname: '/login', expected: true, description: 'No user on login page' },
    { user: null, pathname: '/dashboard', expected: true, description: 'No user on dashboard' },
    { user: { user: { first_name: 'John' } }, pathname: '/', expected: true, description: 'User on home page' },
    { user: { user: { first_name: 'John' } }, pathname: '/login', expected: true, description: 'User on login page' },
    { user: { user: { first_name: 'John' } }, pathname: '/dashboard', expected: false, description: 'User on dashboard' },
    { user: { user: { first_name: 'John' } }, pathname: '/profile', expected: false, description: 'User on profile' },
    { user: { user: { first_name: 'John' } }, pathname: '/settings', expected: false, description: 'User on settings' },
  ];

  testCases.forEach(({ user, pathname, expected, description }) => {
    const isAuthenticatedRoute = authenticatedRoutes.includes(pathname);
    const showAuthButtons = !user || !isAuthenticatedRoute;
    const passed = showAuthButtons === expected;
    
    console.log(`${passed ? '✅' : '❌'} ${description}: ${showAuthButtons} (expected ${expected})`);
  });

  return {
    authenticatedRoutes,
    testCases: testCases.map(({ user, pathname, expected, description }) => {
      const isAuthenticatedRoute = authenticatedRoutes.includes(pathname);
      const showAuthButtons = !user || !isAuthenticatedRoute;
      return {
        description,
        user: !!user,
        pathname,
        isAuthenticatedRoute,
        showAuthButtons,
        expected,
        passed: showAuthButtons === expected
      };
    })
  };
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Only run in browser for debugging
  (window as any).testNavigation = testNavigationLogic;
} 