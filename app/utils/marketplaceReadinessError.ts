const GENERIC_NOT_FOUND_MESSAGES = [
  "we could not find that",
  "record not found",
  "resource not found",
];

export function marketplaceReadinessErrorMessage(error: unknown, profileType: string): string {
  const rawMessage = error instanceof Error
    ? error.message
    : typeof error === "object" && error && "message" in error
      ? String((error as { message?: unknown }).message || "")
      : "";
  const normalized = rawMessage.trim().replace(/[.!]+$/, "").toLowerCase();

  if (GENERIC_NOT_FOUND_MESSAGES.includes(normalized)) {
    const profileLabel = profileType === "household" ? "household" : "service-provider";
    return `We could not find a ${profileLabel} profile for this account. Switch profiles, or sign out and sign in again.`;
  }

  return rawMessage || "We could not check your setup right now.";
}
