import { API_BASE_URL, getAuthHeaders } from "~/config/api";

export interface EmployerKYCDocument {
  type: string;
  url?: string;
}

export interface EmployerKYCRecord {
  status: string;
  id_type: string;
  id_number: string;
  verified_first_name?: string;
  verified_last_name?: string;
  verified_full_name?: string;
  gender?: string;
  date_of_birth?: string;
  nationality?: string;
  documents: EmployerKYCDocument[];
}

export async function getEmployerKYCRecord(househelpUserId: string): Promise<EmployerKYCRecord | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/kyc/househelp/${encodeURIComponent(househelpUserId)}/employer-view`,
    { headers: getAuthHeaders(), cache: "no-store" },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("We couldn't load the identity record.");
  }
  return (await response.json()) as EmployerKYCRecord;
}
