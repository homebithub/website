import { notificationsService } from '~/services/grpc/notifications.service';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type StartConversationPayload = {
  household_user_id: string;
  househelp_user_id: string;
  household_profile_id?: string;
  househelp_profile_id?: string;
};

async function resolveConversationIdFromList(
  payload: StartConversationPayload,
): Promise<string | undefined> {
  try {
    const data = await notificationsService.listConversations('', 0, 100);
    const conversations: any[] = data?.conversations || [];

    // 1. Try matching by profile IDs first
    if (payload.household_profile_id && payload.househelp_profile_id) {
      const match = conversations.find((c: any) => 
        c.household_profile_id === payload.household_profile_id && 
        c.househelp_profile_id === payload.househelp_profile_id
      );
      if (match?.id) return match.id;
    }

    // 2. Try matching by househelp_profile_id + household_user_id
    if (payload.househelp_profile_id) {
      const match = conversations.find((c: any) => 
        c.househelp_profile_id === payload.househelp_profile_id && 
        (c.household_user_id === payload.household_user_id || c.household_id === payload.household_user_id)
      );
      if (match?.id) return match.id;
    }

    // 3. Fallback: match by user IDs
    const match = conversations.find((c: any) => 
      (c.household_user_id === payload.household_user_id || c.household_id === payload.household_user_id) && 
      (c.househelp_user_id === payload.househelp_user_id || c.househelp_id === payload.househelp_user_id)
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
    const data = await notificationsService.startConversation({
      householdUserId: payload.household_user_id,
      househelpUserId: payload.househelp_user_id,
      householdProfileId: payload.household_profile_id || '',
      househelpProfileId: payload.househelp_profile_id || '',
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
