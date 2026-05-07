import * as grpcWeb from 'grpc-web';

import * as notifications_notifications_pb from '../notifications/notifications_pb'; // proto import: "notifications/notifications.proto"


export class NotificationsServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  listTemplates(
    request: notifications_notifications_pb.ListTemplatesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.ListTemplatesResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.ListTemplatesResponse>;

  createTemplate(
    request: notifications_notifications_pb.CreateTemplateRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.CreateTemplateResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.CreateTemplateResponse>;

  getTemplate(
    request: notifications_notifications_pb.GetTemplateRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.GetTemplateResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.GetTemplateResponse>;

  updateTemplate(
    request: notifications_notifications_pb.UpdateTemplateRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.UpdateTemplateResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.UpdateTemplateResponse>;

  deleteTemplate(
    request: notifications_notifications_pb.DeleteTemplateRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.DeleteTemplateResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.DeleteTemplateResponse>;

  previewTemplate(
    request: notifications_notifications_pb.PreviewTemplateRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.PreviewTemplateResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.PreviewTemplateResponse>;

  sendNotification(
    request: notifications_notifications_pb.SendNotificationRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.SendNotificationResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.SendNotificationResponse>;

  getNotification(
    request: notifications_notifications_pb.GetNotificationRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.GetNotificationResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.GetNotificationResponse>;

  listNotificationsByUser(
    request: notifications_notifications_pb.ListNotificationsByUserRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.ListNotificationsByUserResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.ListNotificationsByUserResponse>;

  markNotificationAsClicked(
    request: notifications_notifications_pb.MarkNotificationAsClickedRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.MarkNotificationAsClickedResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.MarkNotificationAsClickedResponse>;

  markAllNotificationsAsClicked(
    request: notifications_notifications_pb.MarkAllNotificationsAsClickedRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.MarkAllNotificationsAsClickedResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.MarkAllNotificationsAsClickedResponse>;

  getDelivery(
    request: notifications_notifications_pb.GetDeliveryRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.GetDeliveryResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.GetDeliveryResponse>;

  listDeliveries(
    request: notifications_notifications_pb.ListDeliveriesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.ListDeliveriesResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.ListDeliveriesResponse>;

  createBlast(
    request: notifications_notifications_pb.CreateBlastRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.CreateBlastResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.CreateBlastResponse>;

  getBlast(
    request: notifications_notifications_pb.GetBlastRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.GetBlastResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.GetBlastResponse>;

  listBlasts(
    request: notifications_notifications_pb.ListBlastsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.ListBlastsResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.ListBlastsResponse>;

  pauseBlast(
    request: notifications_notifications_pb.BlastActionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.BlastActionResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.BlastActionResponse>;

  cancelBlast(
    request: notifications_notifications_pb.BlastActionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.BlastActionResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.BlastActionResponse>;

  resumeBlast(
    request: notifications_notifications_pb.BlastActionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.BlastActionResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.BlastActionResponse>;

  getUserPreferences(
    request: notifications_notifications_pb.GetUserPreferencesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.GetUserPreferencesResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.GetUserPreferencesResponse>;

  updateUserPreferences(
    request: notifications_notifications_pb.UpdateUserPreferencesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.UpdateUserPreferencesResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.UpdateUserPreferencesResponse>;

  registerPushToken(
    request: notifications_notifications_pb.RegisterPushTokenRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.RegisterPushTokenResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.RegisterPushTokenResponse>;

  getPushTokens(
    request: notifications_notifications_pb.GetPushTokensRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.GetPushTokensResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.GetPushTokensResponse>;

  deletePushToken(
    request: notifications_notifications_pb.DeletePushTokenRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.DeletePushTokenResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.DeletePushTokenResponse>;

  getBlastStatus(
    request: notifications_notifications_pb.GetBlastStatusRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.GetBlastStatusResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.GetBlastStatusResponse>;

  toggleFeatureFlag(
    request: notifications_notifications_pb.ToggleFeatureFlagRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.ToggleFeatureFlagResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.ToggleFeatureFlagResponse>;

  adminListNotifications(
    request: notifications_notifications_pb.AdminListNotificationsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.AdminListNotificationsResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.AdminListNotificationsResponse>;

  adminListConversations(
    request: notifications_notifications_pb.AdminListConversationsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.AdminListConversationsResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.AdminListConversationsResponse>;

  getDeliveryStats(
    request: notifications_notifications_pb.GetDeliveryStatsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.GetDeliveryStatsResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.GetDeliveryStatsResponse>;

  getChannelPerformance(
    request: notifications_notifications_pb.GetChannelPerformanceRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.GetChannelPerformanceResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.GetChannelPerformanceResponse>;

  startConversation(
    request: notifications_notifications_pb.StartConversationRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.StartConversationResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.StartConversationResponse>;

  listConversations(
    request: notifications_notifications_pb.ListConversationsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.ListConversationsResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.ListConversationsResponse>;

  getConversation(
    request: notifications_notifications_pb.GetConversationRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.GetConversationResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.GetConversationResponse>;

  markConversationAsRead(
    request: notifications_notifications_pb.MarkConversationAsReadRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.MarkConversationAsReadResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.MarkConversationAsReadResponse>;

  listMessages(
    request: notifications_notifications_pb.ListMessagesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.ListMessagesResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.ListMessagesResponse>;

  sendMessage(
    request: notifications_notifications_pb.SendMessageRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.SendMessageResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.SendMessageResponse>;

  editMessage(
    request: notifications_notifications_pb.EditMessageRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.EditMessageResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.EditMessageResponse>;

  deleteMessage(
    request: notifications_notifications_pb.DeleteMessageRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.DeleteMessageResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.DeleteMessageResponse>;

  toggleReaction(
    request: notifications_notifications_pb.ToggleReactionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.ToggleReactionResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.ToggleReactionResponse>;

  listReactions(
    request: notifications_notifications_pb.ListReactionsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.ListReactionsResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.ListReactionsResponse>;

  sendEmail(
    request: notifications_notifications_pb.SendEmailRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.SendEmailResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.SendEmailResponse>;

  purgeUserData(
    request: notifications_notifications_pb.PurgeUserDataRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_notifications_pb.PurgeUserDataResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_notifications_pb.PurgeUserDataResponse>;

}

export class NotificationsServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  listTemplates(
    request: notifications_notifications_pb.ListTemplatesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.ListTemplatesResponse>;

  createTemplate(
    request: notifications_notifications_pb.CreateTemplateRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.CreateTemplateResponse>;

  getTemplate(
    request: notifications_notifications_pb.GetTemplateRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.GetTemplateResponse>;

  updateTemplate(
    request: notifications_notifications_pb.UpdateTemplateRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.UpdateTemplateResponse>;

  deleteTemplate(
    request: notifications_notifications_pb.DeleteTemplateRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.DeleteTemplateResponse>;

  previewTemplate(
    request: notifications_notifications_pb.PreviewTemplateRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.PreviewTemplateResponse>;

  sendNotification(
    request: notifications_notifications_pb.SendNotificationRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.SendNotificationResponse>;

  getNotification(
    request: notifications_notifications_pb.GetNotificationRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.GetNotificationResponse>;

  listNotificationsByUser(
    request: notifications_notifications_pb.ListNotificationsByUserRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.ListNotificationsByUserResponse>;

  markNotificationAsClicked(
    request: notifications_notifications_pb.MarkNotificationAsClickedRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.MarkNotificationAsClickedResponse>;

  markAllNotificationsAsClicked(
    request: notifications_notifications_pb.MarkAllNotificationsAsClickedRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.MarkAllNotificationsAsClickedResponse>;

  getDelivery(
    request: notifications_notifications_pb.GetDeliveryRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.GetDeliveryResponse>;

  listDeliveries(
    request: notifications_notifications_pb.ListDeliveriesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.ListDeliveriesResponse>;

  createBlast(
    request: notifications_notifications_pb.CreateBlastRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.CreateBlastResponse>;

  getBlast(
    request: notifications_notifications_pb.GetBlastRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.GetBlastResponse>;

  listBlasts(
    request: notifications_notifications_pb.ListBlastsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.ListBlastsResponse>;

  pauseBlast(
    request: notifications_notifications_pb.BlastActionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.BlastActionResponse>;

  cancelBlast(
    request: notifications_notifications_pb.BlastActionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.BlastActionResponse>;

  resumeBlast(
    request: notifications_notifications_pb.BlastActionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.BlastActionResponse>;

  getUserPreferences(
    request: notifications_notifications_pb.GetUserPreferencesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.GetUserPreferencesResponse>;

  updateUserPreferences(
    request: notifications_notifications_pb.UpdateUserPreferencesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.UpdateUserPreferencesResponse>;

  registerPushToken(
    request: notifications_notifications_pb.RegisterPushTokenRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.RegisterPushTokenResponse>;

  getPushTokens(
    request: notifications_notifications_pb.GetPushTokensRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.GetPushTokensResponse>;

  deletePushToken(
    request: notifications_notifications_pb.DeletePushTokenRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.DeletePushTokenResponse>;

  getBlastStatus(
    request: notifications_notifications_pb.GetBlastStatusRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.GetBlastStatusResponse>;

  toggleFeatureFlag(
    request: notifications_notifications_pb.ToggleFeatureFlagRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.ToggleFeatureFlagResponse>;

  adminListNotifications(
    request: notifications_notifications_pb.AdminListNotificationsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.AdminListNotificationsResponse>;

  adminListConversations(
    request: notifications_notifications_pb.AdminListConversationsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.AdminListConversationsResponse>;

  getDeliveryStats(
    request: notifications_notifications_pb.GetDeliveryStatsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.GetDeliveryStatsResponse>;

  getChannelPerformance(
    request: notifications_notifications_pb.GetChannelPerformanceRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.GetChannelPerformanceResponse>;

  startConversation(
    request: notifications_notifications_pb.StartConversationRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.StartConversationResponse>;

  listConversations(
    request: notifications_notifications_pb.ListConversationsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.ListConversationsResponse>;

  getConversation(
    request: notifications_notifications_pb.GetConversationRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.GetConversationResponse>;

  markConversationAsRead(
    request: notifications_notifications_pb.MarkConversationAsReadRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.MarkConversationAsReadResponse>;

  listMessages(
    request: notifications_notifications_pb.ListMessagesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.ListMessagesResponse>;

  sendMessage(
    request: notifications_notifications_pb.SendMessageRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.SendMessageResponse>;

  editMessage(
    request: notifications_notifications_pb.EditMessageRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.EditMessageResponse>;

  deleteMessage(
    request: notifications_notifications_pb.DeleteMessageRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.DeleteMessageResponse>;

  toggleReaction(
    request: notifications_notifications_pb.ToggleReactionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.ToggleReactionResponse>;

  listReactions(
    request: notifications_notifications_pb.ListReactionsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.ListReactionsResponse>;

  sendEmail(
    request: notifications_notifications_pb.SendEmailRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.SendEmailResponse>;

  purgeUserData(
    request: notifications_notifications_pb.PurgeUserDataRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_notifications_pb.PurgeUserDataResponse>;

}

