import { transport, getGrpcMetadata } from '~/utils/grpcClient';
import { NotificationsServiceClient } from '~/proto/notifications/notifications.client';
import { StartConversationRequest, ListConversationsRequest } from '~/proto/notifications/notifications';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ConversationLike = {
  id?: string;
  ID?: string;
  conversation_id?: string;
  household_id?: string;
  househelp_id?: string;
  household_user_id?: string;
  househelp_user_id?: string;
  household_profile_id?: string;
  househelp_profile_id?: string;
  household?: { id?: string; user_id?: string };
  househelp?: { id?: string; user_id?: string };
};

export type StartConversationPayload = {
  household_user_id: string;
  househelp_user_id: string;
  household_profile_id?: string;
  househelp_profile_id?: string;
};

function normalizeConversationId(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

function extractConversationId(data: any): string | undefined {
  return (
    normalizeConversationId(data?.id) ||
    normalizeConversationId(data?.ID) ||
    normalizeConversationId(data?.conversation_id) ||
    normalizeConversationId(data?.data?.id) ||
    normalizeConversationId(data?.data?.ID) ||
    normalizeConversationId(data?.data?.conversation_id)
  );
}

function extractConversations(data: any): ConversationLike[] {
  if (Array.isArray(data?.conversations)) return data.conversations;
  if (Array.isArray(data?.data?.conversations)) return data.data.conversations;
  if (Array.isArray(data?.data?.data?.conversations)) return data.data.data.conversations;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function uniqueIds(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const val of values) {
    const normalized = normalizeConversationId(val);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

function intersects(a: string[], b: string[]): boolean {
  if (a.length === 0 || b.length === 0) return false;
  const setA = new Set(a.map((v) => v.toLowerCase()));
  return b.some((v) => setA.has(v.toLowerCase()));
}

async function resolveConversationIdFromList(
  payload: StartConversationPayload,
): Promise<string | undefined> {
  const client = new NotificationsServiceClient(transport);
  try {
    const request: ListConversationsRequest = { limit: 100, offset: 0 };
    const { response } = await client.listConversations(request, { metadata: getGrpcMetadata() });
    
    const raw = response.data?.fields?.conversations?.listValue?.values || [];
    const conversations = raw.map((v: any) => {
      const c = v.structValue?.fields || {};
      return {
        id: c.id?.stringValue,
        household_id: c.household_user_id?.stringValue || c.household_id?.stringValue,
        househelp_id: c.househelp_user_id?.stringValue || c.househelp_id?.stringValue,
        household_profile_id: c.household_profile_id?.stringValue,
        househelp_profile_id: c.househelp_profile_id?.stringValue
      };
    });

    // 1. Try matching by profile IDs first
    if (payload.household_profile_id && payload.househelp_profile_id) {
      const match = conversations.find((c) => 
        c.household_profile_id === payload.household_profile_id && 
        c.househelp_profile_id === payload.househelp_profile_id
      );
      if (match?.id) return match.id;
    }

    // 2. Try matching by househelp_profile_id + household_user_id
    if (payload.househelp_profile_id) {
      const match = conversations.find((c) => 
        c.househelp_profile_id === payload.househelp_profile_id && 
        c.household_id === payload.household_user_id
      );
      if (match?.id) return match.id;
    }

    // 3. Fallback: match by user IDs
    const match = conversations.find((c) => 
      c.household_id === payload.household_user_id && 
      c.househelp_id === payload.househelp_user_id
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

  const client = new NotificationsServiceClient(transport);
  try {
    const request: StartConversationRequest = {
      householdUserId: payload.household_user_id,
      househelpUserId: payload.househelp_user_id,
      householdProfileId: payload.household_profile_id,
      househelpProfileId: payload.househelp_profile_id
    };

    const { response } = await client.startConversation(request, { metadata: getGrpcMetadata() });
    const conversationId = response.data?.fields?.id?.stringValue || (response as any).id;

    if (conversationId && UUID_REGEX.test(conversationId)) {
      return conversationId;
    }
    
    return resolveConversationIdFromList(payload);
  } catch (err) {
    console.error('[startOrGetConversation] Error:', err);
    throw new Error('Failed to start conversation');
  }
}

export function getInboxRoute(conversationId?: string): string {
  if (conversationId) {
    return `/inbox?conversation=${encodeURIComponent(conversationId)}`;
  }
  return '/inbox';
}
