# Homebit

Homebit is a modern web application designed to connect employers, employees, and agencies for home services. It provides a seamless platform for managing profiles, bookings, and communications in the home services industry.

- [Remix Docs](https://remix.run/docs)



## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

### Environment variables

Expose these environment variables when running the Remix dev server (for example by prefixing the command or using a dotenv solution):

```sh
GOOGLE_CLIENT_ID="<your-google-client-id>" \
AUTH_API_BASE_URL="http://localhost:8080" \
npm run dev
```

- `AUTH_API_BASE_URL` should point to the base of the auth service (e.g. `http://localhost:8080` locally or your deployed API like `https://api.homebit.co.ke/auth`).
- `GOOGLE_CLIENT_ID` is your Google OAuth Client ID for Google Identity Services.

### Google waitlist OAuth callback

The website exposes a callback route for the waitlist OAuth flow:

- Route: `/google/waitlist/callback`
- File: `app/routes/google.waitlist.callback.tsx`

When configured, the auth service will redirect back to this route after the user authenticates with Google. The page will then open the waitlist modal and prefill the user's email and first name.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

### Production environment variables

Set the following in your hosting environment:

- `GOOGLE_CLIENT_ID`
- `AUTH_API_BASE_URL` (e.g. `https://api.homebit.co.ke/auth`)

### End-to-end testing (dev)

1. Start the auth service locally on `http://localhost:8080`.
2. Start the website with the env vars above.
3. Open the site and click "Join Waitlist".
4. Either:
   - Click "Continue with Google" (GSI) to prefill email and first name, then enter your phone and submit; or
   - Click "Sign in with Google (redirect)" to use the server-verified OAuth flow. After returning, the waitlist modal opens with prefills. Enter your phone and submit.
5. Verify a new record appears in the auth database `waitlists` table.
