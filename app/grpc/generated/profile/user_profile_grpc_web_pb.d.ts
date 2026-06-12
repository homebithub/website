import * as grpcWeb from 'grpc-web';

import * as profile_user_profile_pb from '../profile/user_profile_pb'; // proto import: "profile/user_profile.proto"
import * as shared_shared_pb from '../shared/shared_pb'; // proto import: "shared/shared.proto"


export class UserProfileServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getUserProfile(
    request: profile_user_profile_pb.UserProfileIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  deleteUserProfile(
    request: profile_user_profile_pb.UserProfileIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  addPicks(
    request: profile_user_profile_pb.PicksRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  replacePicks(
    request: profile_user_profile_pb.PicksRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  removePick(
    request: profile_user_profile_pb.RemovePickRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  listPicks(
    request: profile_user_profile_pb.UserProfileIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  missingRequirements(
    request: profile_user_profile_pb.UserProfileIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  isComplete(
    request: profile_user_profile_pb.UserProfileIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

}

export class UserProfileServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getUserProfile(
    request: profile_user_profile_pb.UserProfileIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  deleteUserProfile(
    request: profile_user_profile_pb.UserProfileIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  addPicks(
    request: profile_user_profile_pb.PicksRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  replacePicks(
    request: profile_user_profile_pb.PicksRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  removePick(
    request: profile_user_profile_pb.RemovePickRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  listPicks(
    request: profile_user_profile_pb.UserProfileIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  missingRequirements(
    request: profile_user_profile_pb.UserProfileIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  isComplete(
    request: profile_user_profile_pb.UserProfileIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

}

