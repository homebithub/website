import useScrollFadeIn from "~/hooks/useScrollFadeIn";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/_index";
import { lazyLoad } from "~/utils/lazyLoad";
import { getAuthFromCookies } from "~/utils/cookie";
import { useAuth } from "~/contexts/useAuth";
import { getStoredProfileType } from "~/utils/authStorage";

const AuthenticatedHome = lazyLoad(() => import("~/components/HouseholdJobsHome"));
const HousehelpHome = lazyLoad(() => import("~/components/HousehelpJobsHome"));
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
  const { user } = useAuth();

  // Client-side fallback: SSR loader may not see httpOnly cookies,
  // but AuthContext reads the token from localStorage.
  let isAuthenticated = loaderAuth;
  let userType = loaderUserType;

  if (!isAuthenticated && user) {
    isAuthenticated = true;
    userType = (user as any)?.user?.profile_type || getStoredProfileType() || null;
  }

  // Show authenticated home for logged-in users based on profile type
  if (isAuthenticated) {
    if (userType === 'househelp') {
      return <HousehelpHome />;
    }
    // Default for authenticated users (household): show househelp search
    return <AuthenticatedHome />;
  }

  // Show landing/marketing page for non-authenticated users
  return <LandingPage />;
}
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
