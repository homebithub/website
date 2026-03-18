/**
 * Notifications Service - gRPC-Web Client
 *
 * Provides messaging, conversations, notifications, and email methods using gRPC-Web protocol
 */

import { NotificationsServiceClient } from '~/grpc/generated/notifications/notifications_grpc_web_pb';
import notifications_pb_module from '~/grpc/generated/notifications/notifications_pb';
import * as struct_pb from 'google-protobuf/google/protobuf/struct_pb.js';
import { GRPC_WEB_BASE_URL, handleGrpcError } from './client';
import { getAccessTokenFromCookies } from '~/utils/cookie';

// @ts-ignore - Generated protobuf code
const notifications_pb = notifications_pb_module as any;

const notificationsClient = new NotificationsServiceClient(GRPC_WEB_BASE_URL, null, null);

function resolveUserId(userId: string): string {
  if (userId) return userId;
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('user_object');
      if (raw) {
        const user = JSON.parse(raw);
        return user.user_id || user.id || '';
      }
    }
  } catch {}
  return '';
}

function getMetadata(): { [key: string]: string } {
  const md: { [key: string]: string } = {};
  const token = getAccessTokenFromCookies();
  if (token) md['authorization'] = `Bearer ${token}`;
  try {
    if (typeof window !== 'undefined') {
      const profileType = localStorage.getItem('profile_type');
      if (profileType) md['x-profile-type'] = profileType;
    }
  } catch {}
  return md;
}

function jsonResponseToJs(response: any): any {
  if (!response) return null;
  const struct = response.getData?.();
  if (struct && struct.toJavaScript) {
    return struct.toJavaScript();
  }
  return response;
}

function grpcCall<T>(fn: (cb: (err: any, res: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((err, res) => {
      if (err) reject(handleGrpcError(err));
      else resolve(res);
    });
  });
}

// ── Helper: convert JS object to google.protobuf.Struct ────────────────
const _StructClass: any =
  struct_pb.Struct ?? (struct_pb as any).default?.Struct ?? null;

// Strip undefined values recursively — Struct.fromJavaScript throws on undefined
function stripUndefined(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(stripUndefined);
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) clean[k] = stripUndefined(v);
    }
    return clean;
  }
  return obj;
}

function toStruct(obj: Record<string, any>): any {
  if (!obj || typeof obj !== 'object') return null;
  try {
    if (!_StructClass || typeof _StructClass.fromJavaScript !== 'function') {
      console.error('[toStruct] Struct class not available. struct_pb keys:', Object.keys(struct_pb));
      return null;
    }
    return _StructClass.fromJavaScript(stripUndefined(obj));
  } catch (e) {
    console.error('[toStruct] fromJavaScript threw:', e);
    return null;
  }
}

export const notificationsService = {
  // ── Conversations ──────────────────────────────────────

  async listConversations(userId: string, offset = 0, limit = 100): Promise<any> {
    const request = new notifications_pb.ListConversationsRequest();
    request.setUserId(resolveUserId(userId));
    request.setOffset(offset);
    request.setLimit(limit);
    const res = await grpcCall((cb) => notificationsClient.listConversations(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },

  async startConversation(payload: {
    householdUserId: string;
    househelpUserId: string;
    householdProfileId?: string;
    househelpProfileId?: string;
  }): Promise<any> {
    const request = new notifications_pb.StartConversationRequest();
    request.setHouseholdUserId(payload.householdUserId);
    request.setHousehelpUserId(payload.househelpUserId);
    request.setHouseholdProfileId(payload.householdProfileId || '');
    request.setHousehelpProfileId(payload.househelpProfileId || '');
    const res = await grpcCall((cb) => notificationsClient.startConversation(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },

  async getConversation(id: string): Promise<any> {
    const request = new notifications_pb.GetConversationRequest();
    request.setId(id);
    const res = await grpcCall((cb) => notificationsClient.getConversation(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },

  async markConversationAsRead(conversationId: string, userId: string): Promise<any> {
    const request = new notifications_pb.MarkConversationAsReadRequest();
    request.setConversationId(conversationId);
    request.setUserId(resolveUserId(userId));
    const res = await grpcCall((cb) => notificationsClient.markConversationAsRead(request, getMetadata(), cb));
    return res;
  },

  // ── Messages ───────────────────────────────────────────

  async listMessages(conversationId: string, offset = 0, limit = 50): Promise<any> {
    const request = new notifications_pb.ListMessagesRequest();
    request.setConversationId(conversationId);
    request.setOffset(offset);
    request.setLimit(limit);
    const res = await grpcCall((cb) => notificationsClient.listMessages(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },

  async sendMessage(conversationId: string, body: string, replyToId = '', userId = '', senderProfileId = '', senderProfileType = ''): Promise<any> {
    const request = new notifications_pb.SendMessageRequest();
    request.setConversationId(conversationId);
    request.setBody(body);
    request.setReplyToId(replyToId);
    request.setUserId(resolveUserId(userId));
    request.setSenderProfileId(senderProfileId);
    request.setSenderProfileType(senderProfileType);
    const res = await grpcCall((cb) => notificationsClient.sendMessage(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },

  async editMessage(messageId: string, userId: string, body: string): Promise<any> {
    const request = new notifications_pb.EditMessageRequest();
    request.setMessageId(messageId);
    request.setUserId(resolveUserId(userId));
    request.setBody(body);
    const res = await grpcCall((cb) => notificationsClient.editMessage(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },

  async deleteMessage(messageId: string, userId: string): Promise<any> {
    const request = new notifications_pb.DeleteMessageRequest();
    request.setMessageId(messageId);
    request.setUserId(resolveUserId(userId));
    const res = await grpcCall((cb) => notificationsClient.deleteMessage(request, getMetadata(), cb));
    return res;
  },

  // ── Reactions ──────────────────────────────────────────

  async toggleReaction(messageId: string, userId: string, emoji: string, userProfileId = '', userProfileType = ''): Promise<any> {
    const request = new notifications_pb.ToggleReactionRequest();
    request.setMessageId(messageId);
    request.setUserId(resolveUserId(userId));
    request.setEmoji(emoji);
    request.setUserProfileId(userProfileId);
    request.setUserProfileType(userProfileType);
    const res = await grpcCall((cb) => notificationsClient.toggleReaction(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },

  async listReactions(messageId: string, offset = 0, limit = 50): Promise<any> {
    const request = new notifications_pb.ListReactionsRequest();
    request.setMessageId(messageId);
    request.setOffset(offset);
    request.setLimit(limit);
    const res = await grpcCall((cb) => notificationsClient.listReactions(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },

  // ── Notifications ──────────────────────────────────────

  async listNotificationsByUser(userId: string, limit = 20, offset = 0): Promise<any> {
    const request = new notifications_pb.ListNotificationsByUserRequest();
    request.setUserId(resolveUserId(userId));
    request.setLimit(limit);
    request.setOffset(offset);
    const res = await grpcCall((cb) => notificationsClient.listNotificationsByUser(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },

  async markNotificationAsClicked(notificationId: string, userId: string): Promise<any> {
    const request = new notifications_pb.MarkNotificationAsClickedRequest();
    request.setNotificationId(notificationId);
    request.setUserId(resolveUserId(userId));
    const res = await grpcCall((cb) => notificationsClient.markNotificationAsClicked(request, getMetadata(), cb));
    return res;
  },

  async markAllNotificationsAsClicked(userId: string): Promise<any> {
    const request = new notifications_pb.MarkAllNotificationsAsClickedRequest();
    request.setUserId(resolveUserId(userId));
    const res = await grpcCall((cb) => notificationsClient.markAllNotificationsAsClicked(request, getMetadata(), cb));
    return res;
  },

  // ── Email ──────────────────────────────────────────────

  async sendEmail(params: {
    to: string;
    subject: string;
    body: string;
    isHtml?: boolean;
    templateName?: string;
    variables?: Record<string, any>;
    attachmentData?: Uint8Array;
    attachmentName?: string;
    attachmentType?: string;
  }): Promise<any> {
    const request = new notifications_pb.SendEmailRequest();
    request.setTo(params.to);
    request.setSubject(params.subject);
    request.setBody(params.body);
    request.setIsHtml(params.isHtml || false);
    request.setTemplateName(params.templateName || '');
    if (params.variables) {
      const struct = toStruct(params.variables);
      if (struct) request.setVariables(struct);
    }
    if (params.attachmentData) {
      request.setAttachmentData(params.attachmentData);
    }
    request.setAttachmentName(params.attachmentName || '');
    request.setAttachmentType(params.attachmentType || '');
    const res = await grpcCall((cb) => notificationsClient.sendEmail(request, getMetadata(), cb));
    return res;
  },
};

export default notificationsService;
