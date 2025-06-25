// Route configuration for authentication and authorization
export interface RouteConfig {
  path: string;
  requiresAuth: boolean;
  redirectIfAuthenticated?: boolean; // For login/signup pages
  allowedRoles?: string[]; // For role-based access
}

export const routeConfig: Record<string, RouteConfig> = {
  // Public routes - accessible to everyone
  '/': { path: '/', requiresAuth: false },
  '/about': { path: '/about', requiresAuth: false },
  '/contact': { path: '/contact', requiresAuth: false },
  '/services': { path: '/services', requiresAuth: false },
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
  
  // Protected routes - require authentication
  '/profile': { path: '/profile', requiresAuth: true },
  '/settings': { path: '/settings', requiresAuth: true },
  '/change-password': { path: '/change-password', requiresAuth: true },
};

// Helper functions
export function isProtectedRoute(pathname: string): boolean {
  const config = routeConfig[pathname];
  return config?.requiresAuth || false;
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