import * as grpcWeb from 'grpc-web';

import * as profile_pb from './profile_pb'; // proto import: "profile.proto"


export class ProfileServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getCurrentHouseholdProfile(
    request: profile_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: profile_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<profile_pb.JsonResponse>;

  getHouseholdByUserID(
    request: profile_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: profile_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<profile_pb.JsonResponse>;

  searchHouseholds(
    request: profile_pb.SearchRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: profile_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<profile_pb.JsonResponse>;

  getCurrentHousehelpProfile(
    request: profile_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: profile_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<profile_pb.JsonResponse>;

  getHousehelpByID(
    request: profile_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: profile_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<profile_pb.JsonResponse>;

  getHousehelpByUserID(
    request: profile_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: profile_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<profile_pb.JsonResponse>;

  getHousehelpProfileWithUser(
    request: profile_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: profile_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<profile_pb.JsonResponse>;

  searchHousehelps(
    request: profile_pb.SearchRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: profile_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<profile_pb.JsonResponse>;

}

export class ProfileServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getCurrentHouseholdProfile(
    request: profile_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<profile_pb.JsonResponse>;

  getHouseholdByUserID(
    request: profile_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<profile_pb.JsonResponse>;

  searchHouseholds(
    request: profile_pb.SearchRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<profile_pb.JsonResponse>;

  getCurrentHousehelpProfile(
    request: profile_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<profile_pb.JsonResponse>;

  getHousehelpByID(
    request: profile_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<profile_pb.JsonResponse>;

  getHousehelpByUserID(
    request: profile_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<profile_pb.JsonResponse>;

  getHousehelpProfileWithUser(
    request: profile_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<profile_pb.JsonResponse>;

  searchHousehelps(
    request: profile_pb.SearchRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<profile_pb.JsonResponse>;

}

