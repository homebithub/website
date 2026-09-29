import { useRouteLoaderData } from 'react-router';

export function useBlogAvailability(): boolean {
  const root = useRouteLoaderData('root') as { hasPublishedBlogPosts?: boolean } | undefined;
  return root?.hasPublishedBlogPosts === true;
}
