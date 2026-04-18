import { useMemo } from 'react';
import { useSSEContext } from '~/contexts/SSEContext';
import { useSSESubscriptions } from '~/hooks/useSSESubscription';

export type HiringSSEEvent = {
  event_type: string;
  data: {
    request_id?: string;
    contract_id?: string;
    household_id?: string;
    househelp_id?: string;
    household_user_id?: string;
    househelp_user_id?: string;
    household_name?: string;
    househelp_name?: string;
    position?: string;
    salary?: string;
    reason?: string;
    signer_id?: string;
    recipient_id?: string;
    signer_name?: string;
    signer_type?: string;
    terminator_id?: string;
    terminator_name?: string;
    other_party_name?: string;
    days_remaining?: number;
    created_at?: string;
    accepted_at?: string;
    rejected_at?: string;
    signed_at?: string;
    expires_at?: string;
    terminated_at?: string;
  };
};

export type HiringSSEHandler = (event: HiringSSEEvent) => void;

export function useHiringSSE(
  onHireRequestReceived?: HiringSSEHandler,
  onHireRequestAccepted?: HiringSSEHandler,
  onHireRequestRejected?: HiringSSEHandler,
  onContractSigned?: HiringSSEHandler,
  onContractExpiring?: HiringSSEHandler,
  onContractTerminated?: HiringSSEHandler
) {
  const { isConnected, reconnect } = useSSEContext();

  const subscriptions = useMemo(
    () =>
      [
        onHireRequestReceived && { eventType: 'hiring.request.received', handler: onHireRequestReceived as (event: any) => void },
        onHireRequestAccepted && { eventType: 'hiring.request.accepted', handler: onHireRequestAccepted as (event: any) => void },
        onHireRequestRejected && { eventType: 'hiring.request.rejected', handler: onHireRequestRejected as (event: any) => void },
        onContractSigned && { eventType: 'hiring.contract.signed', handler: onContractSigned as (event: any) => void },
        onContractExpiring && { eventType: 'hiring.contract.expiring', handler: onContractExpiring as (event: any) => void },
        onContractTerminated && { eventType: 'hiring.contract.terminated', handler: onContractTerminated as (event: any) => void },
      ].filter(Boolean) as Array<{ eventType: string; handler: (event: any) => void }>,
    [onContractExpiring, onContractSigned, onContractTerminated, onHireRequestAccepted, onHireRequestReceived, onHireRequestRejected]
  );

  useSSESubscriptions(subscriptions, subscriptions.length > 0);

  return {
    isConnected,
    reconnect,
  };
}
