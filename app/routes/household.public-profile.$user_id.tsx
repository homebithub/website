import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";

export default function HouseholdPublicProfileRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user_id } = useParams();

  useEffect(() => {
    navigate(`/household/public-profile?user_id=${user_id}`, {
      replace: true,
      state: location.state,
    });
  }, [user_id, navigate, location.state]);

  return null;
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
