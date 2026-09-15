import HireRequestModal from '~/components/modals/HireRequestModal';

/**
 * Chat and public profiles deliberately share one hire-request flow. A request
 * always points at a real listing; chat must not silently skip ahead and create
 * a contract with a second set of terms.
 */
export default function ConversationHire({
  serviceProviderProfileId,
  serviceProviderName,
  listingId,
  onClose,
  onHired,
}: {
  serviceProviderProfileId: string;
  serviceProviderName: string;
  listingId?: string | number;
  onClose: () => void;
  onHired: (requestId: string) => void;
}) {
  return (
    <HireRequestModal
      isOpen
      onClose={onClose}
      serviceProviderId={serviceProviderProfileId}
      serviceProviderName={serviceProviderName}
      initialListingId={listingId}
      onSent={(request) => onHired(String(request.id || request.hire_request_id || ''))}
    />
  );
}
