// Route configuration for authentication and authorization
export interface RouteConfig {
  path: string;
  requiresAuth: boolean;
  redirectIfAuthenticated?: boolean; // For login/signup pages
  allowedRoles?: string[]; // For role-based access
}

/**
 * PUBLIC ROUTES - Accessible without authentication
 * All routes NOT listed here are PROTECTED and require authentication
 */
export const routeConfig: Record<string, RouteConfig> = {
  // ==================== PUBLIC ROUTES ====================
  // Landing and informational pages
  '/': { path: '/', requiresAuth: false },
  '/about': { path: '/about', requiresAuth: false },
  '/contact': { path: '/contact', requiresAuth: false },
  '/services': { path: '/services', requiresAuth: false },
  '/pricing': { path: '/pricing', requiresAuth: false },
  '/privacy': { path: '/privacy', requiresAuth: false },
  '/terms': { path: '/terms', requiresAuth: false },
  '/cookies': { path: '/cookies', requiresAuth: false },
  '/unauthorized': { path: '/unauthorized', requiresAuth: false },
  
  // Authentication routes - should redirect authenticated users away
  '/login': { path: '/login', requiresAuth: false, redirectIfAuthenticated: true },
  '/signup': { path: '/signup', requiresAuth: false, redirectIfAuthenticated: true },
  '/forgot-password': { path: '/forgot-password', requiresAuth: false },
  '/reset-password': { path: '/reset-password', requiresAuth: false },
  '/verify-otp': { path: '/verify-otp', requiresAuth: false },
  '/verify-email': { path: '/verify-email', requiresAuth: false },
  '/google/auth/callback': { path: '/google/auth/callback', requiresAuth: false },
  '/google/waitlist/callback': { path: '/google/waitlist/callback', requiresAuth: false },
  
  // Public profile pages (view only)
  '/household/public-profile': { path: '/household/public-profile', requiresAuth: false },
  '/househelp/public-profile': { path: '/househelp/public-profile', requiresAuth: false },
  
  // ==================== PROTECTED ROUTES ====================
  // ALL OTHER ROUTES REQUIRE AUTHENTICATION INCLUDING:
  // - /profile-setup/household
  // - /profile-setup/househelp
  // - /household/profile
  // - /househelp/profile
  // - /household/*
  // - /househelp/*
  // - /bureau/*
  // - /inbox
  // - /settings
  // - /change-password
  // - /join-household
  // - /checkout
  // - etc.
  
  // Explicitly defined protected routes (for reference)
  '/profile': { path: '/profile', requiresAuth: true },
  '/settings': { path: '/settings', requiresAuth: true },
  '/change-password': { path: '/change-password', requiresAuth: true },
  '/profile-setup/household': { path: '/profile-setup/household', requiresAuth: true },
  '/profile-setup/househelp': { path: '/profile-setup/househelp', requiresAuth: true },
  '/household/profile': { path: '/household/profile', requiresAuth: true },
  '/househelp/profile': { path: '/househelp/profile', requiresAuth: true },
  '/inbox': { path: '/inbox', requiresAuth: true },
  '/join-household': { path: '/join-household', requiresAuth: true },
  '/checkout': { path: '/checkout', requiresAuth: true },
};

// Helper functions
export function isProtectedRoute(pathname: string): boolean {
  const config = routeConfig[pathname];
  // If route is explicitly defined, use its config
  if (config) {
    return config.requiresAuth;
  }
  
  // Default: All routes NOT explicitly marked as public are PROTECTED
  // Check if route matches any public route patterns
  const publicRoutes = Object.values(routeConfig)
    .filter(c => !c.requiresAuth)
    .map(c => c.path);
  
  // Exact match check
  if (publicRoutes.includes(pathname)) {
    return false;
  }
  
  // Pattern match for public profile routes
  if (pathname.startsWith('/household/public-profile') || 
      pathname.startsWith('/househelp/public-profile')) {
    return false;
  }
  
  // All other routes are protected by default
  return true;
}

export function shouldRedirectAuthenticated(pathname: string): boolean {
  const config = routeConfig[pathname];
  return config?.redirectIfAuthenticated || false;
}

export function getRouteConfig(pathname: string): RouteConfig | undefined {
  return routeConfig[pathname];
}

// Get all protected routes for easy access
export const protectedRoutes = Object.entries(routeConfig)
  .filter(([_, config]) => config.requiresAuth)
  .map(([path, _]) => path);

// Get all auth routes (login/signup)
export const authRoutes = Object.entries(routeConfig)
  .filter(([_, config]) => config.redirectIfAuthenticated)
  .map(([path, _]) => path); 