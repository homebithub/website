import useScrollFadeIn from "~/hooks/useScrollFadeIn";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLoaderData, redirect } from "react-router";
import type { Route } from "./+types/_index";
import { lazyLoad } from "~/utils/lazyLoad";
import { getJoinRequestStatusOnServer, getProfileSetupProgressOnServer } from "~/services/grpc/serverAuth";
import { getAuthFromCookies } from "~/utils/cookie";
import { useAuth } from "~/contexts/useAuth";
import { getStoredProfileType } from "~/utils/authStorage";

const AuthenticatedHome = lazyLoad(() => import("~/components/HouseholdJobsHome"));
const HousehelpHome = lazyLoad(() => import("~/components/HousehelpJobsHome"));
const LandingPage = lazyLoad(() => import("~/routes/landing"));

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("profile_setup_timeout")), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

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
  const userId = userObj.user_id || userObj.id || "";
  if (!profileType) {
    return { isAuthenticated: true, userType: null };
  }
  if (!userId) {
    return { isAuthenticated: true, userType: profileType };
  }

  // Check progress
  try {
    const progressData = await withTimeout(
      getProfileSetupProgressOnServer(request.url, token, userId, profileType),
      4000
    );
    
    const totalSteps = Number(progressData?.total_steps || 0);
    const lastStep = Number(progressData?.last_completed_step || 0);
    const status = String(progressData?.status || "");
    
    const isComplete = status === 'completed' || (totalSteps > 0 && lastStep >= totalSteps);

    if (!isComplete) {
      if (profileType === 'household' && lastStep === 0) {
        try {
          const joinRequest = await withTimeout(
            getJoinRequestStatusOnServer(request.url, token, userId, profileType),
            3000,
          );
          if (joinRequest?.status === 'pending') {
            throw redirect('/pending-approval');
          }
          if (joinRequest?.status === 'approved') {
            throw redirect('/household/profile');
          }
        } catch (joinErr: any) {
          if (joinErr instanceof Response) throw joinErr;
        }
        throw redirect('/household-choice');
      }
      const setupRoute = profileType === 'household'
        ? `/profile-setup/household?step=${lastStep + 1}`
        : `/profile-setup/househelp?step=${lastStep + 1}`;
      throw redirect(setupRoute);
    }
  } catch (err: any) {
    if (err instanceof Response) throw err; // Re-throw redirects
    
    if (err.code === 'NOT_FOUND' || err.status === 5 || err.message?.includes('not found')) {
      if (profileType === 'household') {
        try {
          const joinRequest = await withTimeout(
            getJoinRequestStatusOnServer(request.url, token, userId, profileType),
            3000,
          );
          if (joinRequest?.status === 'pending') {
            throw redirect('/pending-approval');
          }
          if (joinRequest?.status === 'approved') {
            throw redirect('/household/profile');
          }
        } catch (joinErr: any) {
          if (joinErr instanceof Response) throw joinErr;
        }
        throw redirect('/household-choice');
      }
      throw redirect('/profile-setup/househelp?step=1');
    }
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
