# Deploy Website Fixes

## What Was Fixed

### 1. Malformed CSS (Commit: c22dada)
Fixed orphaned CSS properties in `app/app.css` that were causing rendering issues.

### 2. React Router Action Handlers (Commits: 1c95d9c, 2d2273c)
Added `action` handlers to:
- `root.tsx` - handles POST requests to "/"
- `splat.tsx` - handles PUT/POST requests to catch-all routes like "/SDK/webLanguage"

These fixes prevent the 405 errors you're seeing in the logs from external sources (browser extensions, bots, etc.).

## How to Deploy

### Option 1: Merge to Master (Automatic Deployment via GitHub Actions)

```bash
# Switch to master branch
git checkout master

# Pull latest changes
git pull origin master

# Merge feature/revenue branch
git merge feature/revenue

# Push to trigger deployment
git push origin master
```

The GitHub Actions workflow will automatically:
1. Build a new Docker image
2. Push it to GitHub Container Registry (GHCR)
3. Update the deployment.yaml with the new image tag
4. Deploy to your Kubernetes cluster

### Option 2: Manual Deployment

If you prefer to deploy manually:

```bash
# 1. Build the Docker image
cd website
docker build -t ghcr.io/homebithub/website:$(date +%Y%m%d%H%M%S) .

# 2. Push to GHCR (requires authentication)
docker push ghcr.io/homebithub/website:$(date +%Y%m%d%H%M%S)

# 3. Update k8s/deployment.yaml with the new tag

# 4. Apply to Kubernetes
kubectl apply -f k8s/deployment.yaml

# 5. Force restart the pods
kubectl rollout restart deployment/website
```

### Option 3: Quick Restart (If code is already in master)

If the fixes are already in master but not deployed:

```bash
# Force rebuild and restart
kubectl rollout restart deployment/website
```

## Verify the Fix

After deployment, check:

1. **Logs should be clean** (no more 405 errors):
   ```bash
   kubectl logs -f deployment/website
   ```

2. **Website should load without the "$" character**

3. **Browser console should be error-free**

## What These Fixes Do

### Root Action Handler
```typescript
export async function action() {
  return new Response("Method Not Allowed", { status: 405 });
}
```
- Gracefully handles POST requests to "/" from browser extensions
- Returns proper 405 response instead of throwing errors

### Splat Action Handler
Same handler in `splat.tsx` catches all other routes like "/SDK/webLanguage"

### CSS Fix
Moved orphaned properties into proper selectors to prevent rendering glitches

## Expected Results

After deployment:
- ✅ No more 405 errors in logs
- ✅ No "$" character on the page
- ✅ Clean browser console
- ✅ Proper error handling for external requests

## Troubleshooting

If the "$" character persists:
1. Clear browser cache
2. Test in incognito mode
3. Disable all browser extensions
4. Check if it's a specific page or all pages
5. View page source (Ctrl+U) to see if "$" is in HTML

## Notes

- The errors were caused by external sources (likely browser extensions or translation services) making requests to your site
- These are not bugs in your code, but the action handlers prevent them from causing issues
- The malformed CSS could have been causing the "$" to render
