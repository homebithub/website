import { apiClient } from '~/utils/apiClient';

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
  notificationsBase: string,
  payload: StartConversationPayload,
): Promise<string | undefined> {
  const convRes = await apiClient.auth(`${notificationsBase}/api/v1/inbox/conversations?offset=0&limit=100`);
  if (!convRes.ok) return undefined;

  const response = await apiClient.json<any>(convRes);
  const conversations = extractConversations(response);

  // 1. Try matching by profile IDs first (strongest match, mirrors backend)
  if (payload.household_profile_id && payload.househelp_profile_id) {
    const match = conversations.find((c) => {
      const convHouseholdProfileIds = uniqueIds([
        c.household_profile_id,
        c.household?.id,
      ]);
      const convHousehelpProfileIds = uniqueIds([
        c.househelp_profile_id,
        c.househelp?.id,
      ]);
      return (
        intersects(uniqueIds([payload.household_profile_id]), convHouseholdProfileIds) &&
        intersects(uniqueIds([payload.househelp_profile_id]), convHousehelpProfileIds)
      );
    });
    if (match) return extractConversationId(match);
  }

  // 2. Try matching by househelp_profile_id + household_user_id
  //    (covers rows where household_profile_id is null)
  if (payload.househelp_profile_id) {
    const match = conversations.find((c) => {
      const convHousehelpProfileIds = uniqueIds([
        c.househelp_profile_id,
        c.househelp?.id,
      ]);
      const convHouseholdUserIds = uniqueIds([
        c.household_user_id,
        c.household_id,
        c.household?.user_id,
      ]);
      return (
        intersects(uniqueIds([payload.househelp_profile_id]), convHousehelpProfileIds) &&
        intersects(uniqueIds([payload.household_user_id]), convHouseholdUserIds)
      );
    });
    if (match) return extractConversationId(match);
  }

  // 3. Fallback: match by user IDs
  const expectedHouseholdIds = uniqueIds([payload.household_user_id]);
  const expectedHousehelpIds = uniqueIds([payload.househelp_user_id]);

  const match = conversations.find((c) => {
    const conversationHouseholdIds = uniqueIds([
      c.household_user_id,
      c.household_id,
      c.household?.user_id,
    ]);
    const conversationHousehelpIds = uniqueIds([
      c.househelp_user_id,
      c.househelp_id,
      c.househelp?.user_id,
    ]);
    return (
      intersects(expectedHouseholdIds, conversationHouseholdIds) &&
      intersects(expectedHousehelpIds, conversationHousehelpIds)
    );
  });

  return extractConversationId(match);
}

export async function startOrGetConversation(
  notificationsBase: string,
  payload: StartConversationPayload,
): Promise<string | undefined> {
  const existingId = await resolveConversationIdFromList(notificationsBase, payload);
  if (existingId && UUID_REGEX.test(existingId)) {
    return existingId;
  }

  const res = await apiClient.auth(`${notificationsBase}/api/v1/inbox/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to start conversation');
  }

  let conversationId: string | undefined;
  try {
    const data = await apiClient.json<any>(res);
    conversationId = extractConversationId(data);
  } catch {
    conversationId = undefined;
  }

  if (!conversationId || !UUID_REGEX.test(conversationId)) {
    return resolveConversationIdFromList(notificationsBase, payload);
  }

  return conversationId;
}

export function getInboxRoute(conversationId?: string): string {
  if (conversationId) {
    return `/inbox?conversation=${encodeURIComponent(conversationId)}`;
  }
  return '/inbox';
}
