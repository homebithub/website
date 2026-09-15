import { notificationsService } from '~/services/grpc/notifications.service';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type LegacyServiceProviderIdentifiers = {
  service_provider_user_id?: string;
  service_provider_profile_id?: string;
  /** @deprecated Use service_provider_user_id for new integrations. */
  househelp_user_id: string;
  /** @deprecated Use service_provider_profile_id for new integrations. */
  househelp_profile_id?: string;
};

type CanonicalServiceProviderIdentifiers = {
  service_provider_user_id: string;
  service_provider_profile_id?: string;
  /** @deprecated Use service_provider_user_id for new integrations. */
  househelp_user_id?: string;
  /** @deprecated Use service_provider_profile_id for new integrations. */
  househelp_profile_id?: string;
};

export type StartConversationPayload = (LegacyServiceProviderIdentifiers | CanonicalServiceProviderIdentifiers) & {
  household_user_id: string;
  household_profile_id?: string;
  /**
   * The job this conversation is about.
   *
   * A thread belongs to one listing, the way a ride has its own chat: the same
   * two people hiring again start a new thread, both stay readable, and closing
   * a job closes exactly its own conversation. Omitted, the service puts them
   * on the legacy one-thread-per-pair row, which is what every caller did
   * before there was a listing to name.
   */
  listing_id?: string | number;
};

function getServiceProviderUserId(payload: StartConversationPayload): string {
  return payload.service_provider_user_id || payload.househelp_user_id || '';
}

function getServiceProviderProfileId(payload: StartConversationPayload): string | undefined {
  return payload.service_provider_profile_id || payload.househelp_profile_id;
}

async function resolveConversationIdFromList(
  payload: StartConversationPayload,
): Promise<string | undefined> {
  try {
    const data = await notificationsService.listConversations('', 0, 100);
    let conversations: any[] = data?.conversations || [];

    // Narrowed to the job first, when there is one. Without this the fallback
    // matches on the two people alone and would hand back the thread from a
    // different job — which is exactly the conflation job-scoped threads exist
    // to stop, and it would do it silently.
    if (payload.listing_id) {
      const wanted = String(payload.listing_id);
      conversations = conversations.filter((c) => String(c?.listing_id ?? '') === wanted);
    }

    // 1. Try matching by profile IDs first
    const serviceProviderUserId = getServiceProviderUserId(payload);
    const serviceProviderProfileId = getServiceProviderProfileId(payload);

    if (payload.household_profile_id && serviceProviderProfileId) {
      const match = conversations.find((c: any) => 
        c.household_profile_id === payload.household_profile_id && 
        (c.service_provider_profile_id === serviceProviderProfileId ||
          c.househelp_profile_id === serviceProviderProfileId)
      );
      if (match?.id) return match.id;
    }

    // 2. Try matching by service-provider profile + household user ID.
    if (serviceProviderProfileId) {
      const match = conversations.find((c: any) => 
        (c.service_provider_profile_id === serviceProviderProfileId ||
          c.househelp_profile_id === serviceProviderProfileId) &&
        (c.household_user_id === payload.household_user_id || c.household_id === payload.household_user_id)
      );
      if (match?.id) return match.id;
    }

    // 3. Fallback: match by user IDs
    const match = conversations.find((c: any) => 
      (c.household_user_id === payload.household_user_id || c.household_id === payload.household_user_id) && 
      (c.service_provider_user_id === serviceProviderUserId ||
        c.househelp_user_id === serviceProviderUserId ||
        c.househelp_id === serviceProviderUserId)
    );

    return match?.id;
  } catch (err) {
    console.error('[resolveConversationIdFromList] Error:', err);
    return undefined;
  }
}

export async function startOrGetConversation(
  _unused: string,
  payload: StartConversationPayload,
): Promise<string | undefined> {
  const existingId = await resolveConversationIdFromList(payload);
  if (existingId && UUID_REGEX.test(existingId)) {
    return existingId;
  }

  try {
    const serviceProviderUserId = getServiceProviderUserId(payload);
    const serviceProviderProfileId = getServiceProviderProfileId(payload);
    const data = await notificationsService.startConversation({
      householdUserId: payload.household_user_id,
      householdProfileId: payload.household_profile_id || '',
      serviceProviderUserId,
      serviceProviderProfileId,
      listingId: payload.listing_id ? String(payload.listing_id) : '',
    });

    const conversationId = data?.id;

    if (conversationId && UUID_REGEX.test(conversationId)) {
      return conversationId;
    }
    
    return resolveConversationIdFromList(payload);
  } catch (err) {
    console.error('[startOrGetConversation] Error:', err);
    // The backend may have persisted the conversation before erroring (e.g. race / duplicate key).
    // Try resolving from list before giving up.
    const recoveredId = await resolveConversationIdFromList(payload);
    if (recoveredId && UUID_REGEX.test(recoveredId)) {
      return recoveredId;
    }
    throw new Error('Failed to start conversation');
  }
}

export function getInboxRoute(conversationId?: string): string {
  if (conversationId) {
    return `/inbox?conversation=${encodeURIComponent(conversationId)}`;
  }
  return '/inbox';
}
