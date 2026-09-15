import { API_BASE_URL } from '~/config/api';
import { getStoredAccessToken } from '~/utils/authStorage';

/**
 * Fetching a contract as a PDF.
 *
 * The page used to make its own: "Download" opened a popup and called print(),
 * and the email attached an html2pdf screenshot of the rendered DOM. Both
 * produced a picture of whatever the browser happened to be showing — the wrong
 * theme, a half-scrolled section, nothing at all if a stylesheet had not loaded,
 * and a popup an ad blocker would eat. What people keep as their record of an
 * employment agreement should not depend on any of that.
 *
 * The server renders it from the same rows the signatures were written to, so
 * the file says what the contract says.
 */
export async function fetchContractPdf(contractId: string): Promise<Blob> {
  const token = getStoredAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/api/v1/employment-contracts/${encodeURIComponent(contractId)}/pdf`,
    {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    },
  );

  if (!response.ok) {
    // The endpoint answers with JSON when it refuses, and the message in it is
    // written for the person reading it.
    let message = 'We could not produce that document. Please try again.';
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // A non-JSON failure — a proxy error page, say. The default reads better
      // than whatever HTML came back.
    }
    throw new Error(message);
  }

  return response.blob();
}

/** Saves the contract to the user's downloads. */
export async function downloadContractPdf(contractId: string, filename?: string): Promise<void> {
  const blob = await fetchContractPdf(contractId);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `homebit-employment-contract-${contractId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Freed on the next tick rather than immediately: revoking before the browser
  // has started reading the blob cancels the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The same bytes, as the array the email service wants for an attachment. */
export async function contractPdfBytes(contractId: string): Promise<Uint8Array> {
  const blob = await fetchContractPdf(contractId);
  return new Uint8Array(await blob.arrayBuffer());
}
