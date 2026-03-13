import * as grpcWeb from 'grpc-web';

import * as payments_payments_pb from '../payments/payments_pb'; // proto import: "payments/payments.proto"


export class PaymentsServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getPlans(
    request: payments_payments_pb.GetPlansRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetPlansResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetPlansResponse>;

  getPlan(
    request: payments_payments_pb.GetPlanRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetPlanResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetPlanResponse>;

  createSubscription(
    request: payments_payments_pb.CreateSubscriptionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.CreateSubscriptionResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.CreateSubscriptionResponse>;

  getSubscription(
    request: payments_payments_pb.GetSubscriptionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetSubscriptionResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetSubscriptionResponse>;

  getMySubscription(
    request: payments_payments_pb.GetMySubscriptionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetMySubscriptionResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetMySubscriptionResponse>;

  listMySubscriptions(
    request: payments_payments_pb.ListMySubscriptionsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.ListMySubscriptionsResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.ListMySubscriptionsResponse>;

  cancelSubscription(
    request: payments_payments_pb.CancelSubscriptionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.CancelSubscriptionResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.CancelSubscriptionResponse>;

  checkSubscriptionAccess(
    request: payments_payments_pb.CheckSubscriptionAccessRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.CheckSubscriptionAccessResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.CheckSubscriptionAccessResponse>;

  pauseSubscription(
    request: payments_payments_pb.PauseSubscriptionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.PauseSubscriptionResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.PauseSubscriptionResponse>;

  resumeSubscription(
    request: payments_payments_pb.ResumeSubscriptionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.ResumeSubscriptionResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.ResumeSubscriptionResponse>;

  getPauseStatus(
    request: payments_payments_pb.GetPauseStatusRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetPauseStatusResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetPauseStatusResponse>;

  initiateCancellation(
    request: payments_payments_pb.InitiateCancellationRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.InitiateCancellationResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.InitiateCancellationResponse>;

  acceptRetentionOffer(
    request: payments_payments_pb.AcceptRetentionOfferRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.AcceptRetentionOfferResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.AcceptRetentionOfferResponse>;

  confirmCancellation(
    request: payments_payments_pb.ConfirmCancellationRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.ConfirmCancellationResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.ConfirmCancellationResponse>;

  undoCancellation(
    request: payments_payments_pb.UndoCancellationRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.UndoCancellationResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.UndoCancellationResponse>;

  getCancellationStatus(
    request: payments_payments_pb.GetCancellationStatusRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetCancellationStatusResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetCancellationStatusResponse>;

  createSubscriptionCheckout(
    request: payments_payments_pb.CreateSubscriptionCheckoutRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.CreateSubscriptionCheckoutResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.CreateSubscriptionCheckoutResponse>;

  initiatePayment(
    request: payments_payments_pb.InitiatePaymentRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.InitiatePaymentResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.InitiatePaymentResponse>;

  getPayment(
    request: payments_payments_pb.GetPaymentRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetPaymentResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetPaymentResponse>;

  listMyPayments(
    request: payments_payments_pb.ListMyPaymentsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.ListMyPaymentsResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.ListMyPaymentsResponse>;

  checkPaymentStatus(
    request: payments_payments_pb.CheckPaymentStatusRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.CheckPaymentStatusResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.CheckPaymentStatusResponse>;

  downloadReceipt(
    request: payments_payments_pb.DownloadReceiptRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.DownloadReceiptResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.DownloadReceiptResponse>;

  emailReceipt(
    request: payments_payments_pb.EmailReceiptRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.EmailReceiptResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.EmailReceiptResponse>;

  previewProration(
    request: payments_payments_pb.PreviewProrationRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.PreviewProrationResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.PreviewProrationResponse>;

  changePlan(
    request: payments_payments_pb.ChangePlanRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.ChangePlanResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.ChangePlanResponse>;

  getProrationHistory(
    request: payments_payments_pb.GetProrationHistoryRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetProrationHistoryResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetProrationHistoryResponse>;

  getCreditBalance(
    request: payments_payments_pb.GetCreditBalanceRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetCreditBalanceResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetCreditBalanceResponse>;

  getFraudStats(
    request: payments_payments_pb.GetFraudStatsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetFraudStatsResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetFraudStatsResponse>;

  getFlaggedUsers(
    request: payments_payments_pb.GetFlaggedUsersRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetFlaggedUsersResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetFlaggedUsersResponse>;

  getBlacklistedPhones(
    request: payments_payments_pb.GetBlacklistedPhonesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetBlacklistedPhonesResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetBlacklistedPhonesResponse>;

  getBlacklistedIPs(
    request: payments_payments_pb.GetBlacklistedIPsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetBlacklistedIPsResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetBlacklistedIPsResponse>;

  blacklistPhone(
    request: payments_payments_pb.BlacklistPhoneRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.BlacklistPhoneResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.BlacklistPhoneResponse>;

  blacklistIP(
    request: payments_payments_pb.BlacklistIPRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.BlacklistIPResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.BlacklistIPResponse>;

  removePhoneFromBlacklist(
    request: payments_payments_pb.RemovePhoneFromBlacklistRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.RemovePhoneFromBlacklistResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.RemovePhoneFromBlacklistResponse>;

  removeIPFromBlacklist(
    request: payments_payments_pb.RemoveIPFromBlacklistRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.RemoveIPFromBlacklistResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.RemoveIPFromBlacklistResponse>;

  getFraudRules(
    request: payments_payments_pb.GetFraudRulesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetFraudRulesResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetFraudRulesResponse>;

  updateFraudRule(
    request: payments_payments_pb.UpdateFraudRuleRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.UpdateFraudRuleResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.UpdateFraudRuleResponse>;

  getAnalytics(
    request: payments_payments_pb.GetAnalyticsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetAnalyticsResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetAnalyticsResponse>;

  getMRRMetrics(
    request: payments_payments_pb.GetMRRMetricsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetMRRMetricsResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetMRRMetricsResponse>;

  getChurnMetrics(
    request: payments_payments_pb.GetChurnMetricsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetChurnMetricsResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetChurnMetricsResponse>;

  getRevenueMetrics(
    request: payments_payments_pb.GetRevenueMetricsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetRevenueMetricsResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetRevenueMetricsResponse>;

  getCohortAnalysis(
    request: payments_payments_pb.GetCohortAnalysisRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetCohortAnalysisResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetCohortAnalysisResponse>;

  forecastRevenue(
    request: payments_payments_pb.ForecastRevenueRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.ForecastRevenueResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.ForecastRevenueResponse>;

  getUserAnalytics(
    request: payments_payments_pb.GetUserAnalyticsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetUserAnalyticsResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetUserAnalyticsResponse>;

  addPaymentMethod(
    request: payments_payments_pb.AddPaymentMethodRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.AddPaymentMethodResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.AddPaymentMethodResponse>;

  getPaymentMethods(
    request: payments_payments_pb.GetPaymentMethodsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetPaymentMethodsResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetPaymentMethodsResponse>;

  getDefaultPaymentMethod(
    request: payments_payments_pb.GetDefaultPaymentMethodRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.GetDefaultPaymentMethodResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.GetDefaultPaymentMethodResponse>;

  setDefaultPaymentMethod(
    request: payments_payments_pb.SetDefaultPaymentMethodRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.SetDefaultPaymentMethodResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.SetDefaultPaymentMethodResponse>;

  removePaymentMethod(
    request: payments_payments_pb.RemovePaymentMethodRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.RemovePaymentMethodResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.RemovePaymentMethodResponse>;

  updatePaymentMethodNickname(
    request: payments_payments_pb.UpdatePaymentMethodNicknameRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: payments_payments_pb.UpdatePaymentMethodNicknameResponse) => void
  ): grpcWeb.ClientReadableStream<payments_payments_pb.UpdatePaymentMethodNicknameResponse>;

}

export class PaymentsServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getPlans(
    request: payments_payments_pb.GetPlansRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetPlansResponse>;

  getPlan(
    request: payments_payments_pb.GetPlanRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetPlanResponse>;

  createSubscription(
    request: payments_payments_pb.CreateSubscriptionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.CreateSubscriptionResponse>;

  getSubscription(
    request: payments_payments_pb.GetSubscriptionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetSubscriptionResponse>;

  getMySubscription(
    request: payments_payments_pb.GetMySubscriptionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetMySubscriptionResponse>;

  listMySubscriptions(
    request: payments_payments_pb.ListMySubscriptionsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.ListMySubscriptionsResponse>;

  cancelSubscription(
    request: payments_payments_pb.CancelSubscriptionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.CancelSubscriptionResponse>;

  checkSubscriptionAccess(
    request: payments_payments_pb.CheckSubscriptionAccessRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.CheckSubscriptionAccessResponse>;

  pauseSubscription(
    request: payments_payments_pb.PauseSubscriptionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.PauseSubscriptionResponse>;

  resumeSubscription(
    request: payments_payments_pb.ResumeSubscriptionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.ResumeSubscriptionResponse>;

  getPauseStatus(
    request: payments_payments_pb.GetPauseStatusRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetPauseStatusResponse>;

  initiateCancellation(
    request: payments_payments_pb.InitiateCancellationRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.InitiateCancellationResponse>;

  acceptRetentionOffer(
    request: payments_payments_pb.AcceptRetentionOfferRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.AcceptRetentionOfferResponse>;

  confirmCancellation(
    request: payments_payments_pb.ConfirmCancellationRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.ConfirmCancellationResponse>;

  undoCancellation(
    request: payments_payments_pb.UndoCancellationRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.UndoCancellationResponse>;

  getCancellationStatus(
    request: payments_payments_pb.GetCancellationStatusRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetCancellationStatusResponse>;

  createSubscriptionCheckout(
    request: payments_payments_pb.CreateSubscriptionCheckoutRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.CreateSubscriptionCheckoutResponse>;

  initiatePayment(
    request: payments_payments_pb.InitiatePaymentRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.InitiatePaymentResponse>;

  getPayment(
    request: payments_payments_pb.GetPaymentRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetPaymentResponse>;

  listMyPayments(
    request: payments_payments_pb.ListMyPaymentsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.ListMyPaymentsResponse>;

  checkPaymentStatus(
    request: payments_payments_pb.CheckPaymentStatusRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.CheckPaymentStatusResponse>;

  downloadReceipt(
    request: payments_payments_pb.DownloadReceiptRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.DownloadReceiptResponse>;

  emailReceipt(
    request: payments_payments_pb.EmailReceiptRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.EmailReceiptResponse>;

  previewProration(
    request: payments_payments_pb.PreviewProrationRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.PreviewProrationResponse>;

  changePlan(
    request: payments_payments_pb.ChangePlanRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.ChangePlanResponse>;

  getProrationHistory(
    request: payments_payments_pb.GetProrationHistoryRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetProrationHistoryResponse>;

  getCreditBalance(
    request: payments_payments_pb.GetCreditBalanceRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetCreditBalanceResponse>;

  getFraudStats(
    request: payments_payments_pb.GetFraudStatsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetFraudStatsResponse>;

  getFlaggedUsers(
    request: payments_payments_pb.GetFlaggedUsersRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetFlaggedUsersResponse>;

  getBlacklistedPhones(
    request: payments_payments_pb.GetBlacklistedPhonesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetBlacklistedPhonesResponse>;

  getBlacklistedIPs(
    request: payments_payments_pb.GetBlacklistedIPsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetBlacklistedIPsResponse>;

  blacklistPhone(
    request: payments_payments_pb.BlacklistPhoneRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.BlacklistPhoneResponse>;

  blacklistIP(
    request: payments_payments_pb.BlacklistIPRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.BlacklistIPResponse>;

  removePhoneFromBlacklist(
    request: payments_payments_pb.RemovePhoneFromBlacklistRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.RemovePhoneFromBlacklistResponse>;

  removeIPFromBlacklist(
    request: payments_payments_pb.RemoveIPFromBlacklistRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.RemoveIPFromBlacklistResponse>;

  getFraudRules(
    request: payments_payments_pb.GetFraudRulesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetFraudRulesResponse>;

  updateFraudRule(
    request: payments_payments_pb.UpdateFraudRuleRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.UpdateFraudRuleResponse>;

  getAnalytics(
    request: payments_payments_pb.GetAnalyticsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetAnalyticsResponse>;

  getMRRMetrics(
    request: payments_payments_pb.GetMRRMetricsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetMRRMetricsResponse>;

  getChurnMetrics(
    request: payments_payments_pb.GetChurnMetricsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetChurnMetricsResponse>;

  getRevenueMetrics(
    request: payments_payments_pb.GetRevenueMetricsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetRevenueMetricsResponse>;

  getCohortAnalysis(
    request: payments_payments_pb.GetCohortAnalysisRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetCohortAnalysisResponse>;

  forecastRevenue(
    request: payments_payments_pb.ForecastRevenueRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.ForecastRevenueResponse>;

  getUserAnalytics(
    request: payments_payments_pb.GetUserAnalyticsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetUserAnalyticsResponse>;

  addPaymentMethod(
    request: payments_payments_pb.AddPaymentMethodRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.AddPaymentMethodResponse>;

  getPaymentMethods(
    request: payments_payments_pb.GetPaymentMethodsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetPaymentMethodsResponse>;

  getDefaultPaymentMethod(
    request: payments_payments_pb.GetDefaultPaymentMethodRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.GetDefaultPaymentMethodResponse>;

  setDefaultPaymentMethod(
    request: payments_payments_pb.SetDefaultPaymentMethodRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.SetDefaultPaymentMethodResponse>;

  removePaymentMethod(
    request: payments_payments_pb.RemovePaymentMethodRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.RemovePaymentMethodResponse>;

  updatePaymentMethodNickname(
    request: payments_payments_pb.UpdatePaymentMethodNicknameRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<payments_payments_pb.UpdatePaymentMethodNicknameResponse>;

}

