import type { LoaderFunctionArgs } from "react-router";

// Google OAuth authentication callback
// Receives `code` from Google, exchanges it with the Auth API for login/signup
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "";
  
  // Get base URL for redirects
  const origin = url.origin;

  if (!code) {
    return Response.redirect(`${origin}/login?error=missing_code`);
  }

  const baseUrl = process.env.GATEWAY_API_BASE_URL || process.env.AUTH_API_BASE_URL || "https://api.homebit.co.ke";

  try {
    const resp = await fetch(`${baseUrl}/api/v1/auth/google/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, flow: "auth", state }),
    });

    if (!resp.ok) {
      return Response.redirect(`${origin}/login?error=signin_failed`);
    }

    const data: {
      user_id?: string;
      token?: string;
      requires_signup?: boolean;
      email?: string;
      first_name?: string;
      last_name?: string;
      picture?: string;
      google_id?: string;
    } = await resp.json();

    // Check if user already exists (login)
    if (!data.requires_signup && data.token) {
      // Existing user - redirect to appropriate dashboard with token
      const params = new URLSearchParams({
        token: data.token,
        google_login: "success",
      });
      return Response.redirect(`${origin}/login?${params.toString()}`);
    }

    // New user - redirect to signup with Google data prefilled
    if (data.requires_signup) {
      // Parse state to extract profile_type and bureau_id
      console.log('[GOOGLE_CALLBACK] Raw state from Google:', state);
      let stateData: any = {};
      try {
        stateData = state ? JSON.parse(decodeURIComponent(state)) : {};
        console.log('[GOOGLE_CALLBACK] Parsed state data:', stateData);
      } catch (e) {
        console.error('[GOOGLE_CALLBACK] Failed to parse state:', e);
        stateData = {};
      }

      const params = new URLSearchParams({
        google_signup: "1",
        email: data.email || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        google_id: data.google_id || "",
        picture: data.picture || "",
      });
      
      // Preserve profile_type and bureau_id from state
      if (stateData.profile_type) {
        console.log('[GOOGLE_CALLBACK] Adding profile_type to params:', stateData.profile_type);
        params.set("profile_type", stateData.profile_type);
      } else {
        console.warn('[GOOGLE_CALLBACK] No profile_type in state data');
      }
      if (stateData.bureau_id) {
        params.set("bureauId", stateData.bureau_id);
      }
      
      console.log('[GOOGLE_CALLBACK] Final redirect URL:', `${origin}/signup?${params.toString()}`);
      return Response.redirect(`${origin}/signup?${params.toString()}`);
    }

    // Fallback error
    return Response.redirect(`${origin}/login?error=unexpected_response`);
  } catch (e) {
    console.error("Google auth callback error:", e);
    return Response.redirect(`${origin}/login?error=network_error`);
  }
}
