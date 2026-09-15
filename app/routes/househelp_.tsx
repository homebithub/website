import { redirect } from "react-router";

export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  return redirect(`/service-provider/profile${url.search}${url.hash}`);
}

export default function LegacyHousehelpIndexRoute() {
  return null;
}
