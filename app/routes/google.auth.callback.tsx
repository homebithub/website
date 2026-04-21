import type { LoaderFunctionArgs } from "react-router";
import { googleSignInOnServer } from "~/services/grpc/serverAuth";
import { cookieOptions, serializeCookie, TOKEN_COOKIE_NAME } from "~/utils/cookie";

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

  try {
    const data = await googleSignInOnServer(request.url, { code, flow: "auth" });

    // Check if user already exists (login)
    if (!data.requiresSignup && data.token) {
      const headers = new Headers();
      headers.set("Location", `${origin}/login?google_login=success`);
      headers.append(
        "Set-Cookie",
        serializeCookie(TOKEN_COOKIE_NAME, data.token, cookieOptions),
      );
      headers.set("Cache-Control", "no-store");
      return new Response(null, {
        status: 302,
        headers,
      });
    }

    // New user - redirect to signup with Google data prefilled
    if (data.requiresSignup) {
      // Parse state to extract profile_type and bureau_id
      let stateData: any = {};
      try {
        stateData = state ? JSON.parse(decodeURIComponent(state)) : {};
      } catch (e) {
        console.error('[GOOGLE_CALLBACK] Failed to parse state:', e);
        stateData = {};
      }

      const params = new URLSearchParams({
        google_signup: "1",
        email: data.email || "",
        first_name: data.firstName || "",
        last_name: data.lastName || "",
        google_id: data.googleId || "",
        picture: data.picture || "",
      });
      
      // Preserve profile_type and bureau_id from state
      if (stateData.profile_type) {
        params.set("profile_type", stateData.profile_type);
      }
      if (stateData.bureau_id) {
        params.set("bureauId", stateData.bureau_id);
      }
      
      return Response.redirect(`${origin}/signup?${params.toString()}`);
    }

    // Fallback error
    return Response.redirect(`${origin}/login?error=unexpected_response`);
  } catch (e) {
    console.error("Google auth callback error:", e);
    return Response.redirect(`${origin}/login?error=network_error`);
  }
}
