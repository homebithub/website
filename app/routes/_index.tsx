import useScrollFadeIn from "~/hooks/useScrollFadeIn";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLoaderData, redirect } from "react-router";
import { lazyLoad } from "~/utils/lazyLoad";
import { transport, getGrpcMetadata } from "~/utils/grpcClient";
import { ProfileSetupServiceClient } from "~/proto/auth/auth.client";
import { UserIdRequest } from "~/proto/auth/auth";

const AuthenticatedHome = lazyLoad(() => import("~/components/AuthenticatedHome"));
const HousehelpHome = lazyLoad(() => import("~/components/HousehelpHome"));
const LandingPage = lazyLoad(() => import("~/routes/landing"));

export async function clientLoader() {
  const token = localStorage.getItem('token');
  const userObjRaw = localStorage.getItem('user_object');
  
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

  // Check progress
  try {
    const profileSetupClient = new ProfileSetupServiceClient(transport);
    const request: UserIdRequest = { userId: userObj.id };
    const { response: setupData } = await profileSetupClient.getProgress(request, { metadata: { authorization: `Bearer ${token}` } });
    
    const progressData = setupData.data?.fields || {};
    const totalSteps = progressData.total_steps?.numberValue || 0;
    const lastStep = progressData.last_completed_step?.numberValue || 0;
    const status = progressData.status?.stringValue || "";
    
    const isComplete = status === 'completed' || (totalSteps > 0 && lastStep >= totalSteps);

    if (!isComplete) {
      if (profileType === 'household' && lastStep === 0) {
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
        throw redirect('/household-choice');
      }
      throw redirect('/profile-setup/househelp?step=1');
    }
  }

  return { isAuthenticated: true, userType: profileType };
}

clientLoader.hydrate = true;

export default function Index() {
  useScrollFadeIn();
  const { isAuthenticated, userType } = useLoaderData<typeof clientLoader>();

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
