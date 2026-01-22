
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** website
- **Date:** 2026-01-22
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 User Login with Valid Credentials
- **Test Code:** [TC001_User_Login_with_Valid_Credentials.py](./TC001_User_Login_with_Valid_Credentials.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/d3a97851-f043-4b43-b9d8-10f0a5065d7f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 User Login with Invalid Credentials
- **Test Code:** [TC002_User_Login_with_Invalid_Credentials.py](./TC002_User_Login_with_Invalid_Credentials.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/7cdc468c-9a25-4704-b392-ab3065c5401b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Authentication Token Session Persistence
- **Test Code:** [TC003_Authentication_Token_Session_Persistence.py](./TC003_Authentication_Token_Session_Persistence.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/3bafa5f7-6779-4a37-bba4-5687cf04861f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Profile Setup Gating for Incomplete Profiles
- **Test Code:** [TC004_Profile_Setup_Gating_for_Incomplete_Profiles.py](./TC004_Profile_Setup_Gating_for_Incomplete_Profiles.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/eedeb91f-7442-44a6-80ec-05d7401249ba
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Profile Setup Completion Unlocks Access
- **Test Code:** [TC005_Profile_Setup_Completion_Unlocks_Access.py](./TC005_Profile_Setup_Completion_Unlocks_Access.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/shopping.svg:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:5173/mtoi.svg:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/11bb203b-3a87-4224-973a-80b01c770827
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Dark and Light Theme Toggle with Persistence
- **Test Code:** [TC006_Dark_and_Light_Theme_Toggle_with_Persistence.py](./TC006_Dark_and_Light_Theme_Toggle_with_Persistence.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/3980f1ff-4bb8-4d50-a605-12b99f21463b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Role-Based Navigation and UI Rendering
- **Test Code:** [TC007_Role_Based_Navigation_and_UI_Rendering.py](./TC007_Role_Based_Navigation_and_UI_Rendering.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/572f8809-331f-430c-8dcb-5023592c23bc
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Hiring Request Creation and Workflow
- **Test Code:** [TC008_Hiring_Request_Creation_and_Workflow.py](./TC008_Hiring_Request_Creation_and_Workflow.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/5152bb91-7d07-4809-a00d-90d9980e01a5
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Inbox Messaging and Real-Time Notifications
- **Test Code:** [TC009_Inbox_Messaging_and_Real_Time_Notifications.py](./TC009_Inbox_Messaging_and_Real_Time_Notifications.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/db1def45-bbb7-4ce7-aa79-c9a59518785d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Subscription Plan Browsing and Checkout Workflow
- **Test Code:** [TC010_Subscription_Plan_Browsing_and_Checkout_Workflow.py](./TC010_Subscription_Plan_Browsing_and_Checkout_Workflow.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/587b9a2f-3aa3-46d4-9b45-516f675915ec
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Public Marketing Pages Accessibility
- **Test Code:** [TC011_Public_Marketing_Pages_Accessibility.py](./TC011_Public_Marketing_Pages_Accessibility.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/08aa8ef7-5006-4fdd-9eff-b9a970e3e9c5
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Performance Instrumentation and Web Vitals Logging
- **Test Code:** [TC012_Performance_Instrumentation_and_Web_Vitals_Logging.py](./TC012_Performance_Instrumentation_and_Web_Vitals_Logging.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/53acfeb1-b240-405a-a096-8fcf0d75b01d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 SSR Express Server Route and Asset Serving
- **Test Code:** [TC013_SSR_Express_Server_Route_and_Asset_Serving.py](./TC013_SSR_Express_Server_Route_and_Asset_Serving.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/2237aba6-175d-49a2-9381-822f4fbea34a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Routing Enforcement Using React Router Protected Routes
- **Test Code:** [TC014_Routing_Enforcement_Using_React_Router_Protected_Routes.py](./TC014_Routing_Enforcement_Using_React_Router_Protected_Routes.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/ec3ec386-1548-43d3-8d38-0527c7a94212
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Centralized API Fetch Wrapper Error Handling
- **Test Code:** [TC015_Centralized_API_Fetch_Wrapper_Error_Handling.py](./TC015_Centralized_API_Fetch_Wrapper_Error_Handling.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Warning: Prop `%s` did not match. Server: %s Client: %s%s className "h-full dark" "h-full" 
    at html
    at App (http://localhost:5173/app/root.tsx:17:7)
    at WithComponentProps2 (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6989:19)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5936:26)
    at RenderErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:5892:5)
    at DataRoutes (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6686:3)
    at Router (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6772:13)
    at RouterProvider (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:6492:3)
    at RouterProvider2
    at RemixErrorBoundary (http://localhost:5173/node_modules/.vite/deps/chunk-M74W3BAK.js?v=554f9911:9689:5)
    at HydratedRouter (http://localhost:5173/node_modules/.vite/deps/chunk-H35AWJN4.js?v=554f9911:186:46) (at http://localhost:5173/node_modules/.vite/deps/chunk-E22KYI7D.js?v=554f9911:520:37)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Error fetching preferences: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON (at http://localhost:5173/app/utils/preferencesApi.ts:30:12)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
[ERROR] Failed to load resource: the server responded with a status of 405 () (at https://homebit.co.ke/auth/api/v1/preferences:0:0)
[ERROR] Failed to update preferences:  (at http://localhost:5173/app/utils/preferencesApi.ts:50:14)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3f537919-06b1-4e0d-885b-2b7f18faa5e7/f709e9e5-71bf-4506-975c-2e32ff703003
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **0.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---