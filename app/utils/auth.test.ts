// Test utility for authentication protection
import { isProtectedRoute, shouldRedirectAuthenticated, protectedRoutes, authRoutes } from '~/config/routeConfig';

export function testAuthProtection() {
  console.log('Testing authentication protection...');

  // Test protected routes
  const protectedRouteTests = [
    { path: '/dashboard', expected: true, description: 'Dashboard should be protected' },
    { path: '/profile', expected: true, description: 'Profile should be protected' },
    { path: '/settings', expected: true, description: 'Settings should be protected' },
    { path: '/change-password', expected: true, description: 'Change password should be protected' },
    { path: '/', expected: false, description: 'Home should not be protected' },
    { path: '/login', expected: false, description: 'Login should not be protected' },
    { path: '/signup', expected: false, description: 'Signup should not be protected' },
    { path: '/about', expected: false, description: 'About should not be protected' },
  ];

  console.log('\n=== Protected Route Tests ===');
  protectedRouteTests.forEach(({ path, expected, description }) => {
    const isProtected = isProtectedRoute(path);
    const passed = isProtected === expected;
    console.log(`${passed ? '✅' : '❌'} ${description}: ${isProtected} (expected ${expected})`);
  });

  // Test auth routes (should redirect authenticated users)
  const authRouteTests = [
    { path: '/login', expected: true, description: 'Login should redirect authenticated users' },
    { path: '/signup', expected: true, description: 'Signup should redirect authenticated users' },
    { path: '/dashboard', expected: false, description: 'Dashboard should not redirect authenticated users' },
    { path: '/', expected: false, description: 'Home should not redirect authenticated users' },
  ];

  console.log('\n=== Auth Route Tests ===');
  authRouteTests.forEach(({ path, expected, description }) => {
    const shouldRedirect = shouldRedirectAuthenticated(path);
    const passed = shouldRedirect === expected;
    console.log(`${passed ? '✅' : '❌'} ${description}: ${shouldRedirect} (expected ${expected})`);
  });

  // Test route arrays
  console.log('\n=== Route Arrays ===');
  console.log('Protected routes:', protectedRoutes);
  console.log('Auth routes:', authRoutes);

  return {
    protectedRouteTests: protectedRouteTests.map(({ path, expected, description }) => {
      const isProtected = isProtectedRoute(path);
      return {
        description,
        path,
        isProtected,
        expected,
        passed: isProtected === expected
      };
    }),
    authRouteTests: authRouteTests.map(({ path, expected, description }) => {
      const shouldRedirect = shouldRedirectAuthenticated(path);
      return {
        description,
        path,
        shouldRedirect,
        expected,
        passed: shouldRedirect === expected
      };
    }),
    protectedRoutes,
    authRoutes
  };
}

// Test navigation scenarios
export function testNavigationScenarios() {
  console.log('\n=== Navigation Scenarios ===');
  
  const scenarios = [
    {
      description: 'Unauthenticated user tries to access dashboard',
      user: null,
      pathname: '/dashboard',
      expectedRedirect: '/login?redirect=%2Fdashboard',
      shouldRedirect: true
    },
    {
      description: 'Unauthenticated user tries to access profile',
      user: null,
      pathname: '/profile',
      expectedRedirect: '/login?redirect=%2Fprofile',
      shouldRedirect: true
    },
    {
      description: 'Authenticated user tries to access login',
      user: { user: { first_name: 'John' } },
      pathname: '/login',
      expectedRedirect: '/dashboard',
      shouldRedirect: true
    },
    {
      description: 'Authenticated user tries to access signup',
      user: { user: { first_name: 'John' } },
      pathname: '/signup',
      expectedRedirect: '/dashboard',
      shouldRedirect: true
    },
    {
      description: 'Authenticated user accesses dashboard',
      user: { user: { first_name: 'John' } },
      pathname: '/dashboard',
      expectedRedirect: null,
      shouldRedirect: false
    },
    {
      description: 'Unauthenticated user accesses public page',
      user: null,
      pathname: '/',
      expectedRedirect: null,
      shouldRedirect: false
    }
  ];

  scenarios.forEach(({ description, user, pathname, expectedRedirect, shouldRedirect }) => {
    const isProtected = isProtectedRoute(pathname);
    const shouldRedirectAuth = shouldRedirectAuthenticated(pathname);
    
    let actualRedirect = null;
    if (!user && isProtected) {
      actualRedirect = `/login?redirect=${encodeURIComponent(pathname)}`;
    } else if (user && shouldRedirectAuth) {
      actualRedirect = '/dashboard';
    }
    
    const passed = actualRedirect === expectedRedirect;
    console.log(`${passed ? '✅' : '❌'} ${description}`);
    console.log(`  Expected: ${expectedRedirect || 'No redirect'}`);
    console.log(`  Actual: ${actualRedirect || 'No redirect'}`);
  });

  return scenarios;
} 