export const SERVICE_PROVIDER_ROUTE_PREFIX = "/service-provider";
export const SERVICE_PROVIDER_PROFILE_ROUTE = `${SERVICE_PROVIDER_ROUTE_PREFIX}/profile`;
export const SERVICE_PROVIDER_PUBLIC_PROFILE_ROUTE = `${SERVICE_PROVIDER_ROUTE_PREFIX}/public-profile`;
export const SERVICE_PROVIDER_HIRING_ROUTE = `${SERVICE_PROVIDER_ROUTE_PREFIX}/hiring`;
export const SERVICE_PROVIDER_HIRE_REQUESTS_ROUTE = `${SERVICE_PROVIDER_ROUTE_PREFIX}/hire-requests`;

export const canonicalizeServiceProviderPath = (pathname: string): string => {
  if (pathname === "/househelp") return SERVICE_PROVIDER_ROUTE_PREFIX;
  if (pathname.startsWith("/househelp/")) {
    return `${SERVICE_PROVIDER_ROUTE_PREFIX}${pathname.slice("/househelp".length)}`;
  }
  return pathname;
};
