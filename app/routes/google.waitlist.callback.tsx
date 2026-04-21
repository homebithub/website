import type { LoaderFunctionArgs } from "react-router";
import { createWaitlistOnServer, googleSignInOnServer } from "~/services/grpc/serverAuth";

// Google OAuth waitlist callback
// Receives `code` from Google, exchanges it with the Auth API, and redirects
// back to the homepage with waitlist modal open and prefilled data when available.
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawState = url.searchParams.get("state") || "";
  
  // Get base URL for redirects
  const origin = url.origin;

  if (!code) {
    return Response.redirect(`${origin}/?waitlist=1&error=missing_code`);
  }

  try {
    const data = await googleSignInOnServer(request.url, { code, flow: "waitlist" });

    const email = data.email || "";
    const firstName = data.firstName || "";
    // Decode state from Google callback (we encoded JSON with phone/message before redirect)
    let state: any = {};
    try {
      state = rawState ? JSON.parse(decodeURIComponent(rawState)) : {};
    } catch {
      state = {};
    }

    const params = new URLSearchParams({ waitlist: "1" });
    if (email) params.set("email", email);
    if (firstName) params.set("first_name", firstName);
    // If we have a phone number in state plus email and first name from Google, auto-create the waitlist entry
    const phone: string | undefined = state?.phone;
    const message: string | undefined = state?.message;
    if (phone && email && firstName) {
      try {
        await createWaitlistOnServer(request.url, {
          phone,
          email,
          first_name: firstName,
          message: message || "",
        });
        params.set("success", "1");
        return Response.redirect(`${origin}/?${params.toString()}`);
      } catch (error: any) {
        params.set("error", encodeURIComponent(String(error?.message || "waitlist_create_failed")));
        return Response.redirect(`${origin}/?${params.toString()}`);
      }
    }
    // Fall back to opening the modal prefilled; user can enter phone and submit
    return Response.redirect(`${origin}/?${params.toString()}`);
  } catch (e) {
    return Response.redirect(`${origin}/?waitlist=1&error=network_error`);
  }
}
