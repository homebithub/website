import { redirect, type LoaderFunctionArgs } from 'react-router';
export function loader({ request }: LoaderFunctionArgs) {
  const old = new URL(request.url);
  const params = new URLSearchParams();
  const role = old.searchParams.get('profile');
  if (role === 'household') params.set('profile_type', 'household');
  if (role === 'service_provider' || role === 'househelp') params.set('profile_type', 'service_provider');
  return redirect(`/signup${params.size ? `?${params}` : ''}`, 302);
}
export default function RetiredWaitlist() { return null; }
