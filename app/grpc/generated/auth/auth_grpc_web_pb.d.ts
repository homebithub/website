import * as grpcWeb from 'grpc-web';

import * as auth_auth_pb from '../auth/auth_pb'; // proto import: "auth/auth.proto"
import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"


export class AuthServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  signup(
    request: auth_auth_pb.SignupRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.SignupResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.SignupResponse>;

  login(
    request: auth_auth_pb.LoginRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.LoginResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.LoginResponse>;

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
               response: auth_auth_pb.VerifyOTPResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.VerifyOTPResponse>;

  resendOTP(
    request: auth_auth_pb.ResendOTPRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.ResendOTPResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.ResendOTPResponse>;

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

}

export class ProfileServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getCurrentHouseholdProfile(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateHouseholdProfile(
    request: auth_auth_pb.UpdateProfileRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHouseholdByUserID(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  searchHouseholds(
    request: auth_auth_pb.SearchRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  countHouseholds(
    request: auth_auth_pb.SearchRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.CountResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.CountResponse>;

  getCurrentHousehelpProfile(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHousehelpByID(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHousehelpByUserID(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHousehelpProfileWithUser(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  searchHousehelpByPhone(
    request: auth_auth_pb.PhoneRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHousehelpsByBureau(
    request: auth_auth_pb.GetByBureauRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  listHousehelps(
    request: auth_auth_pb.ListRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  searchHousehelps(
    request: auth_auth_pb.SearchRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  countHousehelps(
    request: auth_auth_pb.SearchRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.CountResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.CountResponse>;

  searchMultipleWithUser(
    request: auth_auth_pb.SearchRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHousehelpsByStatus(
    request: auth_auth_pb.StatusRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHousehelpsBySkill(
    request: auth_auth_pb.StringFieldRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHousehelpsByLocation(
    request: auth_auth_pb.StringFieldRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHousehelpsByMinRating(
    request: auth_auth_pb.RatingRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getPopularHousehelps(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateProfileOverview(
    request: auth_auth_pb.UpdateProfileFieldRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updatePersonalDetails(
    request: auth_auth_pb.UpdateProfileFieldRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateFamilyContacts(
    request: auth_auth_pb.UpdateProfileFieldRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateEducationHealth(
    request: auth_auth_pb.UpdateProfileFieldRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateEmploymentSalary(
    request: auth_auth_pb.UpdateProfileFieldRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  deleteHousehelp(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  updateHousehelpFields(
    request: auth_auth_pb.UpdateHousehelpFieldsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  saveUserLocation(
    request: auth_auth_pb.SaveUserLocationRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getProfileDocuments(
    request: auth_auth_pb.GetProfileDocumentsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

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

export class EmploymentServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  listByHousehold(
    request: auth_auth_pb.PaginatedUserRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  listByHousehelp(
    request: auth_auth_pb.PaginatedUserRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  hire(
    request: auth_auth_pb.HireEmploymentReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  terminate(
    request: auth_auth_pb.TerminateEmploymentReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  transitionStatus(
    request: auth_auth_pb.TransitionStatusReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getCurrentStatus(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getStatusHistory(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getLatestByProfileID(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getByHouseholdID(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getByProfileID(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getByStatus(
    request: auth_auth_pb.StatusRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  createProfileStatus(
    request: auth_auth_pb.CreateProfileStatusReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateProfileStatus(
    request: auth_auth_pb.UpdateProfileStatusReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  deleteProfileStatus(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

}

export class JobServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createJob(
    request: auth_auth_pb.CreateJobReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getJob(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  listJobs(
    request: auth_auth_pb.ListRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateJob(
    request: auth_auth_pb.UpdateJobReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  deleteJob(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  searchJobs(
    request: auth_auth_pb.SearchRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getLatestJobs(
    request: auth_auth_pb.ListRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  applyForJob(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  closeJob(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  reopenJob(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getJobsByUserID(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getJobsByStatus(
    request: auth_auth_pb.StatusRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getJobsByType(
    request: auth_auth_pb.StringFieldRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getJobsByLocation(
    request: auth_auth_pb.StringFieldRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getJobsBySkill(
    request: auth_auth_pb.StringFieldRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getJobsBySalaryRange(
    request: auth_auth_pb.SalaryRangeRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class ShortlistServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createShortlist(
    request: auth_auth_pb.CreateShortlistReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getShortlist(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateShortlist(
    request: auth_auth_pb.UpdateShortlistReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  deleteShortlist(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  listByHousehold(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  listByProfile(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getShortlistCount(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.CountResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.CountResponse>;

  shortlistExists(
    request: auth_auth_pb.ShortlistExistsReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.BoolResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.BoolResponse>;

}

export class InterestServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createInterest(
    request: auth_auth_pb.CreateInterestReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getInterest(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  deleteInterest(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  listByHousehold(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  listByHousehelp(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  interestExists(
    request: auth_auth_pb.InterestExistsReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.BoolResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.BoolResponse>;

  getInterestCount(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.CountResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.CountResponse>;

  markViewed(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  acceptInterest(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  declineInterest(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

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

}

export class LocationServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createLocation(
    request: auth_auth_pb.CreateLocationReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getLocationSuggestions(
    request: auth_auth_pb.LocationQueryReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  searchLocations(
    request: auth_auth_pb.LocationQueryReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getLocationByID(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getLocationByMapboxID(
    request: auth_auth_pb.StringFieldRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateLocation(
    request: auth_auth_pb.UpdateLocationReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  deleteLocation(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

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

export class PetsServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createPet(
    request: auth_auth_pb.CreatePetReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getPetByID(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  listMyPets(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updatePet(
    request: auth_auth_pb.UpdatePetReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  deletePet(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  listPetsByUserID(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class HouseholdKidsServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createHouseholdKid(
    request: auth_auth_pb.CreateHouseholdKidReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHouseholdKid(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  listHouseholdKids(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateHouseholdKid(
    request: auth_auth_pb.UpdateHouseholdKidReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  deleteHouseholdKid(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

}

export class HousehelpPreferencesServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createHousehelpPreference(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHousehelpPreference(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  listHousehelpPreferences(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateHousehelpPreference(
    request: auth_auth_pb.UpdateByIdPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  deleteHousehelpPreference(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  addChores(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateBudget(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateAvailability(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class HouseholdPreferencesServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  updateBudget(
    request: auth_auth_pb.HouseholdPrefReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateHouseSize(
    request: auth_auth_pb.HouseholdPrefReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class HouseholdMemberServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  validateInviteCode(
    request: auth_auth_pb.StringFieldRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getOrCreateInvitationCode(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  createInvitation(
    request: auth_auth_pb.CreateInvitationReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  listInvitations(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  revokeInvitation(
    request: auth_auth_pb.RevokeInvitationReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  joinHousehold(
    request: auth_auth_pb.JoinHouseholdReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getJoinRequestStatus(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  listPendingRequests(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  approveRequest(
    request: auth_auth_pb.ApproveRejectReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  rejectRequest(
    request: auth_auth_pb.ApproveRejectReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  listMembers(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateMemberRole(
    request: auth_auth_pb.UpdateMemberRoleReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  removeMember(
    request: auth_auth_pb.RemoveMemberReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  transferOwnership(
    request: auth_auth_pb.TransferOwnershipReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getUserHouseholds(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  leaveHousehold(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

}

export class ProfileViewServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  recordView(
    request: auth_auth_pb.RecordViewReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  getViewCount(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.CountResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.CountResponse>;

  getRecentViewers(
    request: auth_auth_pb.GetRecentViewersReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  countHouseholdViews(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.CountResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.CountResponse>;

  getByProfileAndHousehold(
    request: auth_auth_pb.TwoIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  createProfileView(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateProfileView(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  deleteExpiredViews(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  getHouseholdViews(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class PreferencesServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getPreferences(
    request: auth_auth_pb.PreferencesReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updatePreferences(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  deletePreferences(
    request: auth_auth_pb.PreferencesReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  migrateAnonymousToUser(
    request: auth_auth_pb.MigratePrefsReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getAnalytics(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class ProfileSetupServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getProgress(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateProgress(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getSteps(
    request: auth_auth_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateStep(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getSetupAnalytics(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getDropoffAnalysis(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getUsersAtStep(
    request: auth_auth_pb.StepRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  markAbandoned(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

}

export class OnboardingOptionsServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getLanguages(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getCertifications(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getSkills(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getChores(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHouseSizes(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getReligions(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getExperienceLevels(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getSalaryRanges(
    request: auth_auth_pb.SalaryFrequencyRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getPetTypes(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getPetTraits(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getChildrenAgeRanges(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getChildrenCapacities(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getHouseholdSizePreferences(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getLocationTypePreferences(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getFamilyTypePreferences(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getReferenceRelationships(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getOnboardingSteps(
    request: auth_auth_pb.ProfileTypeRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getAllOptions(
    request: auth_auth_pb.ProfileTypeRequest,
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

export class EmploymentContractServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createEmploymentContract(
    request: auth_auth_pb.JsonPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getEmploymentContract(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  updateEmploymentContract(
    request: auth_auth_pb.UpdateByIdPayload,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  deleteEmploymentContract(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  listEmploymentContracts(
    request: auth_auth_pb.ListEmploymentContractsReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  signByHousehold(
    request: auth_auth_pb.SignContractReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  signByHousehelp(
    request: auth_auth_pb.SignContractReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  forwardToHousehelp(
    request: auth_auth_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_auth_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<auth_auth_pb.JsonResponse>;

  getDefaultClauses(
    request: google_protobuf_empty_pb.Empty,
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

}

export class AuthServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  signup(
    request: auth_auth_pb.SignupRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.SignupResponse>;

  login(
    request: auth_auth_pb.LoginRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.LoginResponse>;

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
  ): Promise<auth_auth_pb.VerifyOTPResponse>;

  resendOTP(
    request: auth_auth_pb.ResendOTPRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.ResendOTPResponse>;

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

}

export class ProfileServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getCurrentHouseholdProfile(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateHouseholdProfile(
    request: auth_auth_pb.UpdateProfileRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHouseholdByUserID(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  searchHouseholds(
    request: auth_auth_pb.SearchRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  countHouseholds(
    request: auth_auth_pb.SearchRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.CountResponse>;

  getCurrentHousehelpProfile(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHousehelpByID(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHousehelpByUserID(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHousehelpProfileWithUser(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  searchHousehelpByPhone(
    request: auth_auth_pb.PhoneRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHousehelpsByBureau(
    request: auth_auth_pb.GetByBureauRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  listHousehelps(
    request: auth_auth_pb.ListRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  searchHousehelps(
    request: auth_auth_pb.SearchRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  countHousehelps(
    request: auth_auth_pb.SearchRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.CountResponse>;

  searchMultipleWithUser(
    request: auth_auth_pb.SearchRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHousehelpsByStatus(
    request: auth_auth_pb.StatusRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHousehelpsBySkill(
    request: auth_auth_pb.StringFieldRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHousehelpsByLocation(
    request: auth_auth_pb.StringFieldRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHousehelpsByMinRating(
    request: auth_auth_pb.RatingRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getPopularHousehelps(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateProfileOverview(
    request: auth_auth_pb.UpdateProfileFieldRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updatePersonalDetails(
    request: auth_auth_pb.UpdateProfileFieldRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateFamilyContacts(
    request: auth_auth_pb.UpdateProfileFieldRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateEducationHealth(
    request: auth_auth_pb.UpdateProfileFieldRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateEmploymentSalary(
    request: auth_auth_pb.UpdateProfileFieldRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  deleteHousehelp(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  updateHousehelpFields(
    request: auth_auth_pb.UpdateHousehelpFieldsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  saveUserLocation(
    request: auth_auth_pb.SaveUserLocationRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getProfileDocuments(
    request: auth_auth_pb.GetProfileDocumentsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

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

export class EmploymentServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  listByHousehold(
    request: auth_auth_pb.PaginatedUserRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  listByHousehelp(
    request: auth_auth_pb.PaginatedUserRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  hire(
    request: auth_auth_pb.HireEmploymentReq,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  terminate(
    request: auth_auth_pb.TerminateEmploymentReq,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  transitionStatus(
    request: auth_auth_pb.TransitionStatusReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getCurrentStatus(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getStatusHistory(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getLatestByProfileID(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getByHouseholdID(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getByProfileID(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getByStatus(
    request: auth_auth_pb.StatusRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  createProfileStatus(
    request: auth_auth_pb.CreateProfileStatusReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateProfileStatus(
    request: auth_auth_pb.UpdateProfileStatusReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  deleteProfileStatus(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

}

export class JobServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createJob(
    request: auth_auth_pb.CreateJobReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getJob(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  listJobs(
    request: auth_auth_pb.ListRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateJob(
    request: auth_auth_pb.UpdateJobReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  deleteJob(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  searchJobs(
    request: auth_auth_pb.SearchRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getLatestJobs(
    request: auth_auth_pb.ListRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  applyForJob(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  closeJob(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  reopenJob(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getJobsByUserID(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getJobsByStatus(
    request: auth_auth_pb.StatusRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getJobsByType(
    request: auth_auth_pb.StringFieldRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getJobsByLocation(
    request: auth_auth_pb.StringFieldRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getJobsBySkill(
    request: auth_auth_pb.StringFieldRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getJobsBySalaryRange(
    request: auth_auth_pb.SalaryRangeRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class ShortlistServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createShortlist(
    request: auth_auth_pb.CreateShortlistReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getShortlist(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateShortlist(
    request: auth_auth_pb.UpdateShortlistReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  deleteShortlist(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  listByHousehold(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  listByProfile(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getShortlistCount(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.CountResponse>;

  shortlistExists(
    request: auth_auth_pb.ShortlistExistsReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.BoolResponse>;

}

export class InterestServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createInterest(
    request: auth_auth_pb.CreateInterestReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getInterest(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  deleteInterest(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  listByHousehold(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  listByHousehelp(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  interestExists(
    request: auth_auth_pb.InterestExistsReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.BoolResponse>;

  getInterestCount(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.CountResponse>;

  markViewed(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  acceptInterest(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  declineInterest(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class ReviewServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createReview(
    request: auth_auth_pb.CreateReviewReq,
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

}

export class LocationServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createLocation(
    request: auth_auth_pb.CreateLocationReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getLocationSuggestions(
    request: auth_auth_pb.LocationQueryReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  searchLocations(
    request: auth_auth_pb.LocationQueryReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getLocationByID(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getLocationByMapboxID(
    request: auth_auth_pb.StringFieldRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateLocation(
    request: auth_auth_pb.UpdateLocationReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  deleteLocation(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

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

export class PetsServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createPet(
    request: auth_auth_pb.CreatePetReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getPetByID(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  listMyPets(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updatePet(
    request: auth_auth_pb.UpdatePetReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  deletePet(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  listPetsByUserID(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class HouseholdKidsServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createHouseholdKid(
    request: auth_auth_pb.CreateHouseholdKidReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHouseholdKid(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  listHouseholdKids(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateHouseholdKid(
    request: auth_auth_pb.UpdateHouseholdKidReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  deleteHouseholdKid(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

}

export class HousehelpPreferencesServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createHousehelpPreference(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHousehelpPreference(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  listHousehelpPreferences(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateHousehelpPreference(
    request: auth_auth_pb.UpdateByIdPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  deleteHousehelpPreference(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  addChores(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateBudget(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateAvailability(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class HouseholdPreferencesServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  updateBudget(
    request: auth_auth_pb.HouseholdPrefReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateHouseSize(
    request: auth_auth_pb.HouseholdPrefReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class HouseholdMemberServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  validateInviteCode(
    request: auth_auth_pb.StringFieldRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getOrCreateInvitationCode(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  createInvitation(
    request: auth_auth_pb.CreateInvitationReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  listInvitations(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  revokeInvitation(
    request: auth_auth_pb.RevokeInvitationReq,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  joinHousehold(
    request: auth_auth_pb.JoinHouseholdReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getJoinRequestStatus(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  listPendingRequests(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  approveRequest(
    request: auth_auth_pb.ApproveRejectReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  rejectRequest(
    request: auth_auth_pb.ApproveRejectReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  listMembers(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateMemberRole(
    request: auth_auth_pb.UpdateMemberRoleReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  removeMember(
    request: auth_auth_pb.RemoveMemberReq,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  transferOwnership(
    request: auth_auth_pb.TransferOwnershipReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getUserHouseholds(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  leaveHousehold(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

}

export class ProfileViewServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  recordView(
    request: auth_auth_pb.RecordViewReq,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  getViewCount(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.CountResponse>;

  getRecentViewers(
    request: auth_auth_pb.GetRecentViewersReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  countHouseholdViews(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.CountResponse>;

  getByProfileAndHousehold(
    request: auth_auth_pb.TwoIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  createProfileView(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateProfileView(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  deleteExpiredViews(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  getHouseholdViews(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class PreferencesServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getPreferences(
    request: auth_auth_pb.PreferencesReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updatePreferences(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  deletePreferences(
    request: auth_auth_pb.PreferencesReq,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  migrateAnonymousToUser(
    request: auth_auth_pb.MigratePrefsReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getAnalytics(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class ProfileSetupServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getProgress(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateProgress(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getSteps(
    request: auth_auth_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateStep(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getSetupAnalytics(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getDropoffAnalysis(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getUsersAtStep(
    request: auth_auth_pb.StepRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  markAbandoned(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

}

export class OnboardingOptionsServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getLanguages(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getCertifications(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getSkills(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getChores(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHouseSizes(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getReligions(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getExperienceLevels(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getSalaryRanges(
    request: auth_auth_pb.SalaryFrequencyRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getPetTypes(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getPetTraits(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getChildrenAgeRanges(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getChildrenCapacities(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getHouseholdSizePreferences(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getLocationTypePreferences(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getFamilyTypePreferences(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getReferenceRelationships(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getOnboardingSteps(
    request: auth_auth_pb.ProfileTypeRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getAllOptions(
    request: auth_auth_pb.ProfileTypeRequest,
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

export class EmploymentContractServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createEmploymentContract(
    request: auth_auth_pb.JsonPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getEmploymentContract(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  updateEmploymentContract(
    request: auth_auth_pb.UpdateByIdPayload,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  deleteEmploymentContract(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  listEmploymentContracts(
    request: auth_auth_pb.ListEmploymentContractsReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  signByHousehold(
    request: auth_auth_pb.SignContractReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  signByHousehelp(
    request: auth_auth_pb.SignContractReq,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  forwardToHousehelp(
    request: auth_auth_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_auth_pb.JsonResponse>;

  getDefaultClauses(
    request: google_protobuf_empty_pb.Empty,
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

}

