import useScrollFadeIn from "~/hooks/useScrollFadeIn";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/_index";
import { lazyLoad } from "~/utils/lazyLoad";
import { getAuthFromCookies } from "~/utils/cookie";
import { useAuth } from "~/contexts/useAuth";
import { getStoredProfileType } from "~/utils/authStorage";
import { isServiceProviderProfileType } from "~/utils/profileType";

const AuthenticatedHome = lazyLoad(() => import("~/components/HouseholdJobsHome"));
const ServiceProviderHome = lazyLoad(() => import("~/components/ServiceProviderJobsHome"));
const LandingPage = lazyLoad(() => import("~/routes/landing"));

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const { token, user: cookieUser } = getAuthFromCookies(cookieHeader);
  const userObjRaw = cookieUser ? JSON.stringify(cookieUser) : null;
  
  if (!token || !userObjRaw) {
    return { isAuthenticated: false, userType: null };
  }

  let userObj;
  try {
    userObj = JSON.parse(userObjRaw);
  } catch (e) {
    return { isAuthenticated: false, userType: null };
  }

  const profileType = userObj.profile_type || userObj.role || null;
  if (!profileType) {
    return { isAuthenticated: true, userType: null };
  }

  return { isAuthenticated: true, userType: profileType };
}

export default function Index() {
  useScrollFadeIn();
  const { isAuthenticated: loaderAuth, userType: loaderUserType } = useLoaderData<typeof loader>();
  const { user, loading: authLoading } = useAuth();

  // Client-side fallback: SSR loader may not see httpOnly cookies,
  // but AuthContext reads the token from localStorage.
  // SSR gives the first paint a useful answer, but once the client session
  // check completes it is authoritative. A stale HttpOnly cookie can make the
  // loader say "signed in" while AuthContext correctly clears the session;
  // continuing to trust the loader produced a logged-out navbar over a
  // household homepage.
  const isAuthenticated = authLoading ? loaderAuth : Boolean(user);
  const userType = user
    ? (user as any)?.user?.profile_type || getStoredProfileType() || null
    : authLoading ? loaderUserType : null;

  // Show authenticated home for logged-in users based on profile type
  if (isAuthenticated) {
    if (isServiceProviderProfileType(userType)) {
      return <ServiceProviderHome />;
    }
    // Default for authenticated household users: show service-provider search.
    return <AuthenticatedHome />;
  }

  // Show landing/marketing page for non-authenticated users
  return <LandingPage />;
}
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
