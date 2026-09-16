/**
 * An `initiated` application has two meanings in the hiring state machine:
 * a service provider may have applied, or a household may have sent an offer
 * to someone it shortlisted. Only the latter is waiting for the provider to
 * respond, so it needs its own, unmistakable place in their Hiring workspace.
 */
export type ProviderApplication = {
  status?: string | null;
  initiated_by_applicant?: boolean | string | number | null;
  initiatedByApplicant?: boolean | string | number | null;
};

function isExplicitFalse(value: unknown) {
  return value === false || value === 0 || String(value).trim().toLowerCase() === 'false';
}

export function isIncomingApplicationOffer(application: ProviderApplication) {
  const status = String(application.status || '').trim().toLowerCase();
  const initiator = application.initiated_by_applicant ?? application.initiatedByApplicant;

  // Older rows that do not include the initiator remain in Applications. We
  // must never present an unknown record as an offer that a provider can accept.
  return status === 'initiated' && isExplicitFalse(initiator);
}

export function splitProviderApplications<T extends ProviderApplication>(records: T[]) {
  const offers: T[] = [];
  const applications: T[] = [];

  for (const application of records ?? []) {
    if (isIncomingApplicationOffer(application)) offers.push(application);
    else applications.push(application);
  }

  return { offers, applications };
}
