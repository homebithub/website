import HireRequestModal from '~/components/modals/HireRequestModal';

/**
 * Chat and public profiles deliberately share one hire-request flow. A request
 * always points at a real listing; chat must not silently skip ahead and create
 * a contract with a second set of terms.
 */
export default function ConversationHire({
  househelpProfileId,
  househelpName,
  listingId,
  onClose,
  onHired,
}: {
  househelpProfileId: string;
  househelpName: string;
  listingId?: string | number;
  onClose: () => void;
  onHired: (requestId: string) => void;
}) {
  return (
    <HireRequestModal
      isOpen
      onClose={onClose}
      househelpId={househelpProfileId}
      househelpName={househelpName}
      initialListingId={listingId}
      onSent={(request) => onHired(String(request.id || request.hire_request_id || ''))}
    />
  );
}
