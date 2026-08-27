import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import type { LoginRequest, LoginResponse, LoginErrorResponse } from "~/routes/login";
import { migratePreferences } from '~/utils/preferencesApi';
import { registerCurrentDevice } from '~/utils/deviceFingerprint';
import { extractErrorMessage, transformErrorMessage } from '~/utils/errorMessages';
import { normalizeKenyanPhoneNumber } from '~/utils/validation';
import { AuthContext, type AuthContextType } from "./AuthContextCore";
import { authService } from "~/services/grpc/auth.service";
import { getAuthFromCookies } from "~/utils/cookie";
import { needsRenewal, msUntilRefresh, nextTimerDelay, sessionState } from "~/utils/session";
import {
  cacheAuthSession,
  clearStoredAuthSession,
  getStoredAccessToken,
  getStoredUser,
  normalizeProfileType,
} from "~/utils/authStorage";
import { clearRequestCache } from '~/utils/requestCache';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

function normalizeLoginUser(raw: any, fallbackPhone = '') {
  const userId = raw?.getId?.() || raw?.id || raw?.user_id || raw?.userId || raw?.auth_id || raw?.authId || '';
  return {
    id: userId,
    user_id: userId,
    email: raw?.getEmail?.() || raw?.email || '',
    phone: raw?.getPhone?.() || raw?.phone || raw?.phone_number || raw?.phoneNumber || fallbackPhone,
    first_name: raw?.getFirstName?.() || raw?.first_name || raw?.firstName || '',
    last_name: raw?.getLastName?.() || raw?.last_name || raw?.lastName || '',
    profile_type: raw?.getProfileType?.() || raw?.profile_type || raw?.profileType || '',
    profile_id: raw?.getProfileId?.() || raw?.profile_id || raw?.profileId || '',
    user_profile_id: raw?.getUserProfileId?.() || raw?.user_profile_id || raw?.userProfileId || '',
    is_verified: Boolean(raw?.getIsVerified?.() || raw?.is_verified || raw?.isVerified || false),
    profile_image: raw?.getProfileImage?.() || raw?.profile_image || raw?.profileImage || '',
  };
}

/**
 * Renew a session whose access token has already expired, before anything uses
 * it.
 *
 * Only acts on "expired". A token that is merely close to expiry is left to the
 * renewal timer, and one whose expiry cannot be parsed is left alone entirely —
 * signing someone out over a parsing failure would be worse than doing nothing.
 *
 * Failures are swallowed on purpose: this runs before we know whether the
 * person is even signed in, and the normal unauthenticated path below handles
 * the outcome. Throwing here would turn "your session lapsed" into a broken
 * page.
 */
async function renewExpiredSessionBeforeUse(): Promise<void> {
  if (typeof window === "undefined") return;
  if (sessionState(getStoredAccessToken()) !== "expired") return;

  try {
    const { renewSessionOnce } = await import("~/services/grpc/client");
    await renewSessionOnce();
  } catch {
    // Left to the unauthenticated path.
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Public routes that don't need auth check
  const isPublicRoute = () => {
    const publicPaths = ['/signup', '/login', '/forgot-password', '/reset-password', '/verify-otp', '/verify-email', '/household-choice', '/join-household', '/pending-approval', '/about', '/services', '/contact', '/pricing', '/terms', '/privacy', '/cookies', '/debug'];
    return publicPaths.some(path => location.pathname.startsWith(path)) || location.pathname === '/';
  };

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const performLogout = useCallback(async ({
    redirectTo = "/",
  }: {
    redirectTo?: string;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      try {
        const { default: authService } = await import('~/services/grpc/auth.service');
        await authService.logout();
      } catch {
      }

      clearStoredAuthSession();
      clearRequestCache();

      setUser(null);

      if (typeof window !== "undefined") {
        window.location.href = redirectTo;
      } else {
        navigate(redirectTo);
      }
    } catch (logoutError: any) {
      setError(logoutError.message || "An error occurred during logout");
      throw logoutError;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const checkAuth = async () => {
    try {
      // Renew before anything reads the token, when it has already expired.
      //
      // The renewal timer only runs while a page is open. A tab closed for
      // longer than the token's life comes back holding an expired one, and
      // every request made during bootstrap would race the renewal that the
      // timer is about to schedule — some failing, some not, depending on
      // timing. Settling it here, before `loading` clears and authenticated
      // views render, removes the race rather than making it rarer.
      //
      // This is what allows the access token to be short. Without it, shortening
      // the token only moves the race from unlikely to routine.
      await renewExpiredSessionBeforeUse();

      const token = getStoredAccessToken() || null;
      const cachedUser = getStoredUser();
      const shouldUseCachedUserOnly = location.pathname === '/profile';

      if (cachedUser && token) {
        setUser({ token, user: cachedUser } as unknown as LoginResponse);
        setLoading(false);
        return;
      }

      if (isPublicRoute() || shouldUseCachedUserOnly) {
        setLoading(false);
        return;
      }

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { default: authService } = await import('~/services/grpc/auth.service');
      const userProto = await authService.getCurrentUser();

      const user = {
        id: userProto?.getId?.() || '',
        user_id: userProto?.getId?.() || '',
        email: userProto?.getEmail?.() || '',
        phone: userProto?.getPhone?.() || '',
        first_name: userProto?.getFirstName?.() || '',
        last_name: userProto?.getLastName?.() || '',
        profile_type: userProto?.getProfileType?.() || '',
        is_verified: userProto?.getIsVerified?.() || false,
        profile_image: userProto?.getProfileImage?.() || '',
      };
      
      setUser({ token: token || "", user } as unknown as LoginResponse);
      cacheAuthSession({ token: token || "", user });

    } catch (error: any) {
      console.error("Error checking auth:", error);
      // Only clear auth state on explicit UNAUTHENTICATED errors (gRPC code 16).
      // Transient errors (network, unavailable, internal) should NOT log the user out.
      const isUnauthenticated = error?.code === 16 ||
        error?.message?.includes('UNAUTHENTICATED') ||
        error?.message?.includes('Authentication required');
      if (isUnauthenticated) {
        setUser(null);
        clearStoredAuthSession();
      }
      // For transient errors, keep the cached user state from cookies/localStorage
      // that was set earlier in this function (lines 41-53).
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone: string, password: string, redirectTo?: string) => {
    try {
      setLoading(true);
      setError(null);

      const normalizedPhone = normalizeKenyanPhoneNumber(phone);

      // Through the server, not from here.
      //
      // Both auth cookies are HttpOnly in a deployed environment, and a browser
      // refuses a document.cookie write when an HttpOnly cookie of that name
      // already exists. Signing in from the browser therefore updated
      // localStorage while the refresh cookie kept a token auth had already
      // rotated away — and the next renewal presented it, was refused, and
      // signed the person out. The server holds the only writes that are not
      // silently discarded.
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizedPhone.replace(/^\+/, ''),
          password,
        }),
      });
      const responseBody = (await response.json().catch(() => ({}))) as Record<string, any>;
      if (!response.ok) {
        throw new Error(responseBody?.message || 'Invalid phone number or password.');
      }

      const userData = normalizeLoginUser(
        responseBody.user,
        normalizedPhone.replace(/^\+/, ''),
      );
      const authId = responseBody.auth_id || responseBody.authId || responseBody.user_id || responseBody.userId || userData.user_id;

      if (!authId) {
        throw new Error('Login response is missing the signed-in user.');
      }

      // The password is the whole check.
      //
      // Login already returns an access token and a refresh token — it has
      // verified the password and the account's standing before answering. This
      // threw both away and sent the person to /verify-otp to be issued a
      // second, identical pair, so every sign-in cost an SMS and a six-digit
      // code to arrive at the session it had already been handed.
      //
      // A one-time code is worth asking for when it proves something the
      // password does not: that the phone is reachable at signup, that somebody
      // resetting a forgotten password holds the number. None of those is this.
      // Those flows still go through /verify-otp and are untouched.
      // Read through an envelope as well as off the top level: the body is the
      // LoginResult marshalled directly today, and the neighbouring call sites
      // in this file already defend against a `data` wrapper.
      const token = String(responseBody.token || '');

      if (!token) {
        throw new Error('Login response is missing a session token.');
      }

      const profileType = normalizeProfileType(userData.profile_type || "");

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('user_id', authId);
        if (userData.profile_id) window.localStorage.setItem('profile_id', userData.profile_id);
        if (userData.user_profile_id) {
          window.localStorage.setItem('user_profile_id', userData.user_profile_id);
        }
      }

      const signedIn = { ...userData, user_id: authId, id: authId, profile_type: profileType };
      // Cookies are already set by the response; this keeps localStorage, which
      // is where the app reads the access token from for gRPC metadata.
      clearRequestCache();
      cacheAuthSession({ token, user: signedIn, provider: 'password' });
      setUser({ token, user: signedIn } as unknown as LoginResponse);

      // Registered before navigating, as the verify-otp path did: this is the
      // moment a new device becomes known, and it is what a pending-approval
      // decision is later taken about.
      // Finish device registration before mounting the authenticated app. The
      // revocation watcher runs as soon as that tree mounts; letting this call
      // race it meant a returning browser could be compared with its previous
      // revoked row and immediately sign out an otherwise valid new session.
      // Registration failure remains non-fatal (auth has already accepted the
      // password), but the ordering must be deterministic when it succeeds.
      try {
        await registerCurrentDevice(authId);
      } catch (deviceError) {
        console.warn('Device registration failed:', deviceError);
      }
      migratePreferences().catch((err) => console.error('Failed to migrate preferences:', err));

      // Bureau accounts have their own landing page; everyone else goes home,
      // unless they were sent to the login screen from somewhere in particular.
      // That redirect was accepted on the login page and then dropped, because
      // the OTP detour hardcoded '/' as its destination — so following a link
      // into the site and signing in always landed on the homepage instead.
      const destination = profileType === 'bureau'
        ? '/bureau/househelps'
        : (redirectTo || '/');
      navigate(destination, { replace: true });
      return;
    } catch (error: any) {
      const errorMsg = error.message || "An error occurred during login";
      setError(transformErrorMessage(errorMsg));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      setError(null);

      const { default: authSvc } = await import('~/services/grpc/auth.service');
      const signupResponse = await authSvc.signup(email, password, firstName, lastName, 'household');
      
      const token = signupResponse?.getToken?.() || "";
      const refreshToken = signupResponse?.getRefreshToken?.() || "";
      const userProto = signupResponse?.getUser?.();
      const user = userProto?.toObject?.() || {};

      clearRequestCache();
      cacheAuthSession({ token, refreshToken, user });
      setUser({ token, user } as unknown as LoginResponse);
      
      migratePreferences().catch(err => console.error("Failed to migrate preferences:", err));
      navigate("/");
    } catch (error: any) {
      const errorMsg = error.message || "An error occurred during signup";
      setError(transformErrorMessage(errorMsg));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await performLogout();
  };

  // Renew the session rather than letting it end under the person using it.
  //
  // A timer covers ordinary use; a visibility check covers the tab that was
  // left open while the device slept, which no timer would have fired through.
  // A refusal from the refresh call is the only thing that ends the session,
  // and that means the refresh token itself has expired — at which point asking
  // for a login is correct rather than a failure.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const renewIfNeeded = async () => {
      if (cancelled) return;

      const token = getStoredAccessToken();
      // Only 'expiring' and 'expired' warrant action; a token whose expiry
      // cannot be read is left alone, since it may be perfectly valid.
      if (!needsRenewal(token)) return;

      // Renewed through the shared, server-side path: the refresh cookie is
      // HttpOnly, so reading it here returned nothing and this never renewed
      // anything. Shared so the timer and a retrying request do not each spend
      // a refresh token that auth rotates on use.
      const { renewSessionOnce } = await import("~/services/grpc/client");
      const renewed = await renewSessionOnce();
      if (cancelled) return;

      // Only an outright refusal ends the session.
      //
      // This used to sign out on anything that was not success, which meant a
      // 502, a dropped connection or a pod restarting during a deploy logged
      // people out of a session that was completely valid. The token now lasts
      // four weeks, so a renewal that cannot be reached costs nothing: the timer
      // re-arms and tries again long before the token itself runs out.
      if (renewed === "refused") {
        console.warn("[Auth] Session renewal refused; signing out");
        await performLogout();
      } else if (renewed === "unavailable") {
        console.warn("[Auth] Session renewal unreachable; keeping the session and retrying later");
      }
    };

    const arm = () => {
      if (cancelled) return;
      const untilRefresh = msUntilRefresh(getStoredAccessToken());
      if (untilRefresh === null) return;
      timer = setTimeout(async () => {
        await renewIfNeeded();
        arm();
      }, nextTimerDelay(untilRefresh));
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") void renewIfNeeded();
    };

    void renewIfNeeded();
    arm();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
