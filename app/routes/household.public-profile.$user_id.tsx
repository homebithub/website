import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { Loading } from "~/components/Loading";

export default function HouseholdPublicProfileRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user_id } = useParams();

  useEffect(() => {
    const nextParams = new URLSearchParams(location.search);
    if (user_id) {
      nextParams.set("userId", user_id);
    }
    navigate(`/household/public-profile?${nextParams.toString()}`, {
      replace: true,
      state: location.state,
    });
  }, [user_id, navigate, location.search, location.state]);

  return <Loading text="Redirecting..." />;
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
