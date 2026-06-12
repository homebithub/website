import * as grpcWeb from 'grpc-web';

import * as auth_auth_pb from '../auth/auth_pb'; // proto import: "auth/auth.proto"
import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"
import * as shared_shared_pb from '../shared/shared_pb'; // proto import: "shared/shared.proto"


export class AdminServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  adminListUsers(
    request: auth_auth_pb.AdminListUsersRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminListUsersResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminListUsersResponse>;

  adminGetUser(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminUserResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminUserResponse>;

  adminUpdateUser(
    request: auth_auth_pb.AdminUpdateUserRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminUserResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminUserResponse>;

  adminDeleteUser(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  adminGetUserStats(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminUserStatsResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminUserStatsResponse>;

  adminListKYCSubmissions(
    request: auth_auth_pb.AdminListKYCRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminListKYCResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminListKYCResponse>;

  adminApproveKYC(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  adminRejectKYC(
    request: auth_auth_pb.AdminRejectKYCRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  adminGetKYCStats(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminKYCStatsResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminKYCStatsResponse>;

  adminListReviews(
    request: auth_auth_pb.AdminListReviewsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminListReviewsResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminListReviewsResponse>;

  adminApproveReview(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  adminRejectReview(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  adminGetReviewStats(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminReviewStatsResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminReviewStatsResponse>;

  adminGetDashboardStats(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminDashboardStatsResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminDashboardStatsResponse>;

  adminGetActivityLog(
    request: auth_auth_pb.AdminActivityLogRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminActivityLogResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminActivityLogResponse>;

  adminListFraudAlerts(
    request: auth_auth_pb.AdminListFraudRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminListFraudResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminListFraudResponse>;

  adminMarkFraudResolved(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

}

export class AuthServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  signup(
    request: auth_auth_pb.SignupRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  login(
    request: auth_auth_pb.LoginRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  logout(
    request: auth_auth_pb.LogoutRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  refreshToken(
    request: auth_auth_pb.RefreshTokenRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.RefreshTokenResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.RefreshTokenResponse>;

  validateToken(
    request: auth_auth_pb.ValidateTokenRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.ValidateTokenResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.ValidateTokenResponse>;

  forgotPassword(
    request: auth_auth_pb.ForgotPasswordRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.ForgotPasswordResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.ForgotPasswordResponse>;

  resetPassword(
    request: auth_auth_pb.ResetPasswordRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.LoginResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.LoginResponse>;

  changePassword(
    request: auth_auth_pb.ChangePasswordRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  googleSignIn(
    request: auth_auth_pb.GoogleSignInRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.GoogleSignInResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.GoogleSignInResponse>;

  getGoogleAuthURL(
    request: auth_auth_pb.GetGoogleAuthURLRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.GetGoogleAuthURLResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.GetGoogleAuthURLResponse>;

  completeGoogleSignup(
    request: auth_auth_pb.CompleteGoogleSignupRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.SignupResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.SignupResponse>;

  getCurrentUser(
    request: auth_auth_pb.GetCurrentUserRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.User) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.User>;

  getUser(
    request: auth_auth_pb.GetUserRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.User) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.User>;

  getMultipleUsers(
    request: auth_auth_pb.GetMultipleUsersRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.GetMultipleUsersResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.GetMultipleUsersResponse>;

  updateEmail(
    request: auth_auth_pb.UpdateEmailRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.UpdateEmailResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.UpdateEmailResponse>;

  updatePhone(
    request: auth_auth_pb.UpdatePhoneRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.UpdatePhoneResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.UpdatePhoneResponse>;

  updateUser(
    request: auth_auth_pb.UpdateUserRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.User) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.User>;

  sendOTP(
    request: auth_auth_pb.SendOTPRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  verifyOTP(
    request: auth_auth_pb.VerifyOTPRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  resendOTP(
    request: auth_auth_pb.ResendOTPRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  checkVerificationStatus(
    request: auth_auth_pb.CheckVerificationStatusRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.CheckVerificationStatusResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.CheckVerificationStatusResponse>;

  getVerificationStatus(
    request: auth_auth_pb.GetVerificationStatusRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.VerificationStatusResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.VerificationStatusResponse>;

  listPendingVerifications(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.ListPendingVerificationsResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.ListPendingVerificationsResponse>;

  approveVerification(
    request: auth_auth_pb.ApproveVerificationRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  rejectVerification(
    request: auth_auth_pb.RejectVerificationRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  purgeUserData(
    request: auth_auth_pb.PurgeUserDataRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.PurgeUserDataResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.PurgeUserDataResponse>;

}

export class BureauServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createBureau(
    request: auth_auth_pb.CreateBureauRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.BureauResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.BureauResponse>;

  getBureau(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.BureauResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.BureauResponse>;

  updateBureau(
    request: auth_auth_pb.UpdateBureauRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.BureauResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.BureauResponse>;

  deleteBureau(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  listBureaus(
    request: auth_auth_pb.ListRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.BureauListResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.BureauListResponse>;

  getCurrentBureauProfile(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.BureauResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.BureauResponse>;

  initiateHousehelpLink(
    request: auth_auth_pb.BureauHousehelpLinkInitiateRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.BureauHousehelpLinkResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.BureauHousehelpLinkResponse>;

  verifyHousehelpLink(
    request: auth_auth_pb.BureauHousehelpLinkVerifyRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.BureauHousehelpLinkResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.BureauHousehelpLinkResponse>;

  resendHousehelpLinkOTP(
    request: auth_auth_pb.BureauHousehelpLinkIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.BureauHousehelpLinkResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.BureauHousehelpLinkResponse>;

}

export class HireRequestServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createHireRequest(
    request: auth_auth_pb.CreateHireRequestReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHireRequest(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  listHireRequests(
    request: auth_auth_pb.ListHireRequestsReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateHireRequest(
    request: auth_auth_pb.UpdateHireRequestReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  cancelHireRequest(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  acceptHireRequest(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  declineHireRequest(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  finalizeHireRequest(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class HireContractServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createFromHireRequest(
    request: auth_auth_pb.CreateContractReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHireContract(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  listHireContracts(
    request: auth_auth_pb.ListHireContractsReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  completeHireContract(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  terminateHireContract(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class HireNegotiationServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  addNegotiationMessage(
    request: auth_auth_pb.AddNegotiationReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  listNegotiations(
    request: auth_auth_pb.ListNegotiationsReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class ListingServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createListing(
    request: auth_auth_pb.CreateJobReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  getJobListing(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  listJobs(
    request: auth_auth_pb.ListRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  updateJob(
    request: auth_auth_pb.UpdateJobReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  deleteJob(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  closeListing(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  reopenListing(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  shortlistListing(
    request: auth_auth_pb.CreateApplication,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  promoteToInitiated(
    request: auth_auth_pb.ApplicationActionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  unshortlistListing(
    request: auth_auth_pb.ApplicationActionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  initiateListing(
    request: auth_auth_pb.CreateApplication,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  respondApplication(
    request: auth_auth_pb.RespondApplicationRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  approveApplication(
    request: auth_auth_pb.ApplicationActionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  listApplications(
    request: auth_auth_pb.ListApplicationsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

}

export class ReviewServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createReview(
    request: auth_auth_pb.CreateReviewReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getReview(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHousehelpReviews(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHouseholdReviews(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getPublicReviews(
    request: auth_auth_pb.PaginatedRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getMyReviews(
    request: auth_auth_pb.PaginatedRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getReviewStats(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getPendingVerification(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  verifyReview(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  rejectReview(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHousehelpAverageRating(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  markHelpful(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  unmarkHelpful(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  addResponse(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class ImageServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  uploadImages(
    request: auth_auth_pb.UploadImagesReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getImagesByUser(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getImagesByUserID(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class DocumentServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  uploadDocuments(
    request: auth_auth_pb.UploadDocumentsReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getUserDocuments(
    request: auth_auth_pb.GetUserDocumentsReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getDocumentByID(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateDocumentMetadata(
    request: auth_auth_pb.UpdateDocumentReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  deleteDocument(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  getDocumentDownloadURL(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class ProfileViewServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  recordView(
    request: auth_auth_pb.RecordViewReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.RecordViewResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.RecordViewResponse>;

  getAnalytics(
    request: auth_auth_pb.GetAnalyticsReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateViewDuration(
    request: auth_auth_pb.UpdateViewDurationReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  getProfileViews(
    request: auth_auth_pb.GetProfileViewsReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class ContactServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createContactMessage(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getContactMessages(
    request: auth_auth_pb.ListRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getContactMessageByID(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateContactMessageStatus(
    request: auth_auth_pb.UpdateStatusReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  resolveContactMessage(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  addContactComment(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class WaitlistServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createWaitlist(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getAllWaitlists(
    request: auth_auth_pb.ListRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getWaitlistByID(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateWaitlist(
    request: auth_auth_pb.UpdateByIdPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  deleteWaitlist(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  getWaitlistByEmail(
    request: auth_auth_pb.StringFieldRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getWaitlistByPhone(
    request: auth_auth_pb.PhoneRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class KYCServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  submitKYC(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getMyKYC(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getKYCByID(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateKYCStatus(
    request: auth_auth_pb.UpdateKYCStatusReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  listPendingKYC(
    request: auth_auth_pb.ListRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getSmileIDToken(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  receiveSmileIDWebhook(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class AdminAuthServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  adminLogin(
    request: auth_auth_pb.AdminLoginRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminLoginResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminLoginResponse>;

  adminRefreshToken(
    request: auth_auth_pb.AdminRefreshTokenRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminTokenResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminTokenResponse>;

  adminLogout(
    request: auth_auth_pb.AdminLogoutRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  adminValidateToken(
    request: auth_auth_pb.AdminValidateTokenRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminValidateTokenResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminValidateTokenResponse>;

  createAdminUser(
    request: auth_auth_pb.CreateAdminUserRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminAuthUserResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminAuthUserResponse>;

  listAdminUsers(
    request: auth_auth_pb.ListAdminUsersRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.ListAdminUsersResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.ListAdminUsersResponse>;

  getAdminUser(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminAuthUserResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminAuthUserResponse>;

  updateAdminUser(
    request: auth_auth_pb.UpdateAdminUserRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminAuthUserResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminAuthUserResponse>;

  deactivateAdminUser(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  promoteUserToAdmin(
    request: auth_auth_pb.PromoteUserToAdminRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminAuthUserResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminAuthUserResponse>;

  inviteAdmin(
    request: auth_auth_pb.InviteAdminRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.InviteAdminResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.InviteAdminResponse>;

  acceptInvitation(
    request: auth_auth_pb.AcceptInvitationRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.AdminAuthUserResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.AdminAuthUserResponse>;

  listInvitations(
    request: auth_auth_pb.ListInvitationsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.ListInvitationsResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.ListInvitationsResponse>;

  revokeInvitation(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  createRole(
    request: auth_auth_pb.CreateRoleRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.RoleResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.RoleResponse>;

  listRoles(
    request: auth_auth_pb.ListRolesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.ListRolesResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.ListRolesResponse>;

  getRole(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.RoleResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.RoleResponse>;

  updateRole(
    request: auth_auth_pb.UpdateRoleRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.RoleResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.RoleResponse>;

  deleteRole(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  assignRoleToUser(
    request: auth_auth_pb.AssignRoleRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  removeRoleFromUser(
    request: auth_auth_pb.RemoveRoleRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  listPermissions(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.ListPermissionsResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.ListPermissionsResponse>;

  getUserPermissions(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.UserPermissionsResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.UserPermissionsResponse>;

  updateRolePermissions(
    request: auth_auth_pb.UpdateRolePermissionsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.RoleResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.RoleResponse>;

  checkIsAdmin(
    request: auth_auth_pb.CheckIsAdminRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.CheckIsAdminResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.CheckIsAdminResponse>;

}

export class AdminServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  adminListUsers(
    request: auth_auth_pb.AdminListUsersRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminListUsersResponse>;

  adminGetUser(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminUserResponse>;

  adminUpdateUser(
    request: auth_auth_pb.AdminUpdateUserRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminUserResponse>;

  adminDeleteUser(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  adminGetUserStats(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminUserStatsResponse>;

  adminListKYCSubmissions(
    request: auth_auth_pb.AdminListKYCRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminListKYCResponse>;

  adminApproveKYC(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  adminRejectKYC(
    request: auth_auth_pb.AdminRejectKYCRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  adminGetKYCStats(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminKYCStatsResponse>;

  adminListReviews(
    request: auth_auth_pb.AdminListReviewsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminListReviewsResponse>;

  adminApproveReview(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  adminRejectReview(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  adminGetReviewStats(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminReviewStatsResponse>;

  adminGetDashboardStats(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminDashboardStatsResponse>;

  adminGetActivityLog(
    request: auth_auth_pb.AdminActivityLogRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminActivityLogResponse>;

  adminListFraudAlerts(
    request: auth_auth_pb.AdminListFraudRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminListFraudResponse>;

  adminMarkFraudResolved(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

}

export class AuthServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  signup(
    request: auth_auth_pb.SignupRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  login(
    request: auth_auth_pb.LoginRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  logout(
    request: auth_auth_pb.LogoutRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  refreshToken(
    request: auth_auth_pb.RefreshTokenRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.RefreshTokenResponse>;

  validateToken(
    request: auth_auth_pb.ValidateTokenRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.ValidateTokenResponse>;

  forgotPassword(
    request: auth_auth_pb.ForgotPasswordRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.ForgotPasswordResponse>;

  resetPassword(
    request: auth_auth_pb.ResetPasswordRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.LoginResponse>;

  changePassword(
    request: auth_auth_pb.ChangePasswordRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  googleSignIn(
    request: auth_auth_pb.GoogleSignInRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.GoogleSignInResponse>;

  getGoogleAuthURL(
    request: auth_auth_pb.GetGoogleAuthURLRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.GetGoogleAuthURLResponse>;

  completeGoogleSignup(
    request: auth_auth_pb.CompleteGoogleSignupRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.SignupResponse>;

  getCurrentUser(
    request: auth_auth_pb.GetCurrentUserRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.User>;

  getUser(
    request: auth_auth_pb.GetUserRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.User>;

  getMultipleUsers(
    request: auth_auth_pb.GetMultipleUsersRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.GetMultipleUsersResponse>;

  updateEmail(
    request: auth_auth_pb.UpdateEmailRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.UpdateEmailResponse>;

  updatePhone(
    request: auth_auth_pb.UpdatePhoneRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.UpdatePhoneResponse>;

  updateUser(
    request: auth_auth_pb.UpdateUserRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.User>;

  sendOTP(
    request: auth_auth_pb.SendOTPRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  verifyOTP(
    request: auth_auth_pb.VerifyOTPRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  resendOTP(
    request: auth_auth_pb.ResendOTPRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  checkVerificationStatus(
    request: auth_auth_pb.CheckVerificationStatusRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.CheckVerificationStatusResponse>;

  getVerificationStatus(
    request: auth_auth_pb.GetVerificationStatusRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.VerificationStatusResponse>;

  listPendingVerifications(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.ListPendingVerificationsResponse>;

  approveVerification(
    request: auth_auth_pb.ApproveVerificationRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  rejectVerification(
    request: auth_auth_pb.RejectVerificationRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  purgeUserData(
    request: auth_auth_pb.PurgeUserDataRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.PurgeUserDataResponse>;

}

export class BureauServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createBureau(
    request: auth_auth_pb.CreateBureauRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.BureauResponse>;

  getBureau(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.BureauResponse>;

  updateBureau(
    request: auth_auth_pb.UpdateBureauRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.BureauResponse>;

  deleteBureau(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  listBureaus(
    request: auth_auth_pb.ListRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.BureauListResponse>;

  getCurrentBureauProfile(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.BureauResponse>;

  initiateHousehelpLink(
    request: auth_auth_pb.BureauHousehelpLinkInitiateRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.BureauHousehelpLinkResponse>;

  verifyHousehelpLink(
    request: auth_auth_pb.BureauHousehelpLinkVerifyRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.BureauHousehelpLinkResponse>;

  resendHousehelpLinkOTP(
    request: auth_auth_pb.BureauHousehelpLinkIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.BureauHousehelpLinkResponse>;

}

export class HireRequestServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createHireRequest(
    request: auth_auth_pb.CreateHireRequestReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHireRequest(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  listHireRequests(
    request: auth_auth_pb.ListHireRequestsReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateHireRequest(
    request: auth_auth_pb.UpdateHireRequestReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  cancelHireRequest(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  acceptHireRequest(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  declineHireRequest(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  finalizeHireRequest(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class HireContractServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createFromHireRequest(
    request: auth_auth_pb.CreateContractReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHireContract(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  listHireContracts(
    request: auth_auth_pb.ListHireContractsReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  completeHireContract(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  terminateHireContract(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class HireNegotiationServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  addNegotiationMessage(
    request: auth_auth_pb.AddNegotiationReq,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  listNegotiations(
    request: auth_auth_pb.ListNegotiationsReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class ListingServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createListing(
    request: auth_auth_pb.CreateJobReq,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  getJobListing(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  listJobs(
    request: auth_auth_pb.ListRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  updateJob(
    request: auth_auth_pb.UpdateJobReq,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  deleteJob(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  closeListing(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  reopenListing(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  shortlistListing(
    request: auth_auth_pb.CreateApplication,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  promoteToInitiated(
    request: auth_auth_pb.ApplicationActionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  unshortlistListing(
    request: auth_auth_pb.ApplicationActionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  initiateListing(
    request: auth_auth_pb.CreateApplication,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  respondApplication(
    request: auth_auth_pb.RespondApplicationRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  approveApplication(
    request: auth_auth_pb.ApplicationActionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  listApplications(
    request: auth_auth_pb.ListApplicationsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

}

export class ReviewServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createReview(
    request: auth_auth_pb.CreateReviewReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getReview(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHousehelpReviews(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHouseholdReviews(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getPublicReviews(
    request: auth_auth_pb.PaginatedRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getMyReviews(
    request: auth_auth_pb.PaginatedRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getReviewStats(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getPendingVerification(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  verifyReview(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  rejectReview(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHousehelpAverageRating(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  markHelpful(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  unmarkHelpful(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  addResponse(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class ImageServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  uploadImages(
    request: auth_auth_pb.UploadImagesReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getImagesByUser(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getImagesByUserID(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class DocumentServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  uploadDocuments(
    request: auth_auth_pb.UploadDocumentsReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getUserDocuments(
    request: auth_auth_pb.GetUserDocumentsReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getDocumentByID(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateDocumentMetadata(
    request: auth_auth_pb.UpdateDocumentReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  deleteDocument(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  getDocumentDownloadURL(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class ProfileViewServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  recordView(
    request: auth_auth_pb.RecordViewReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.RecordViewResponse>;

  getAnalytics(
    request: auth_auth_pb.GetAnalyticsReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateViewDuration(
    request: auth_auth_pb.UpdateViewDurationReq,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  getProfileViews(
    request: auth_auth_pb.GetProfileViewsReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class ContactServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createContactMessage(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getContactMessages(
    request: auth_auth_pb.ListRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getContactMessageByID(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateContactMessageStatus(
    request: auth_auth_pb.UpdateStatusReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  resolveContactMessage(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  addContactComment(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class WaitlistServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createWaitlist(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getAllWaitlists(
    request: auth_auth_pb.ListRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getWaitlistByID(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateWaitlist(
    request: auth_auth_pb.UpdateByIdPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  deleteWaitlist(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  getWaitlistByEmail(
    request: auth_auth_pb.StringFieldRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getWaitlistByPhone(
    request: auth_auth_pb.PhoneRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class KYCServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  submitKYC(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getMyKYC(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getKYCByID(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateKYCStatus(
    request: auth_auth_pb.UpdateKYCStatusReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  listPendingKYC(
    request: auth_auth_pb.ListRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getSmileIDToken(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  receiveSmileIDWebhook(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class AdminAuthServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  adminLogin(
    request: auth_auth_pb.AdminLoginRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminLoginResponse>;

  adminRefreshToken(
    request: auth_auth_pb.AdminRefreshTokenRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminTokenResponse>;

  adminLogout(
    request: auth_auth_pb.AdminLogoutRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  adminValidateToken(
    request: auth_auth_pb.AdminValidateTokenRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminValidateTokenResponse>;

  createAdminUser(
    request: auth_auth_pb.CreateAdminUserRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminAuthUserResponse>;

  listAdminUsers(
    request: auth_auth_pb.ListAdminUsersRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.ListAdminUsersResponse>;

  getAdminUser(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminAuthUserResponse>;

  updateAdminUser(
    request: auth_auth_pb.UpdateAdminUserRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminAuthUserResponse>;

  deactivateAdminUser(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  promoteUserToAdmin(
    request: auth_auth_pb.PromoteUserToAdminRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminAuthUserResponse>;

  inviteAdmin(
    request: auth_auth_pb.InviteAdminRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.InviteAdminResponse>;

  acceptInvitation(
    request: auth_auth_pb.AcceptInvitationRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.AdminAuthUserResponse>;

  listInvitations(
    request: auth_auth_pb.ListInvitationsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.ListInvitationsResponse>;

  revokeInvitation(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  createRole(
    request: auth_auth_pb.CreateRoleRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.RoleResponse>;

  listRoles(
    request: auth_auth_pb.ListRolesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.ListRolesResponse>;

  getRole(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.RoleResponse>;

  updateRole(
    request: auth_auth_pb.UpdateRoleRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.RoleResponse>;

  deleteRole(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  assignRoleToUser(
    request: auth_auth_pb.AssignRoleRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  removeRoleFromUser(
    request: auth_auth_pb.RemoveRoleRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  listPermissions(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.ListPermissionsResponse>;

  getUserPermissions(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.UserPermissionsResponse>;

  updateRolePermissions(
    request: auth_auth_pb.UpdateRolePermissionsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.RoleResponse>;

  checkIsAdmin(
    request: auth_auth_pb.CheckIsAdminRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.CheckIsAdminResponse>;

}

