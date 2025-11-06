import type { LoaderFunctionArgs } from "react-router";

// Google OAuth waitlist callback
// Receives `code` from Google, exchanges it with the Auth API, and redirects
// back to the homepage with waitlist modal open and prefilled data when available.
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawState = url.searchParams.get("state") || "";

  if (!code) {
    return Response.redirect(`/?waitlist=1&error=missing_code`);
  }

  const baseUrl = process.env.AUTH_API_BASE_URL || "https://api.homebit.co.ke/auth";

  try {
    const resp = await fetch(`${baseUrl}/api/v1/auth/google/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, flow: "waitlist", state: rawState }),
    });

    if (!resp.ok) {
      return Response.redirect(`/?waitlist=1&error=signin_failed`);
    }

    const data: {
      requires_signup?: boolean;
      requiresSignup?: boolean; // backend uses RequiresSignup
      email?: string;
      first_name?: string;
      firstName?: string;
    } = await resp.json();

    const email = (data as any).Email ?? data.email ?? "";
    const firstName = (data as any).FirstName ?? data.first_name ?? data.firstName ?? "";
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
      const createResp = await fetch(`${baseUrl}/api/v1/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          email,
          first_name: firstName,
          message: message || "",
        }),
      });
      if (createResp.ok) {
        params.set("success", "1");
        return Response.redirect(`/?${params.toString()}`);
      } else {
        // Try to surface backend validation errors if present
        let errText = "waitlist_create_failed";
        try {
          const err = await createResp.json();
          errText = err?.error || Object.values(err?.errors || {}).join(" ") || errText;
        } catch {}
        params.set("error", encodeURIComponent(String(errText)));
        return Response.redirect(`/?${params.toString()}`);
      }
    }
    // Fall back to opening the modal prefilled; user can enter phone and submit
    return Response.redirect(`/?${params.toString()}`);
  } catch (e) {
    return Response.redirect(`/?waitlist=1&error=network_error`);
  }
}
