import * as grpcWeb from 'grpc-web';

import * as marketplace_pb from './marketplace_pb'; // proto import: "marketplace.proto"
import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"


export class ShortlistServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createShortlist(
    request: marketplace_pb.CreateShortlistReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: marketplace_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<marketplace_pb.JsonResponse>;

  deleteShortlist(
    request: marketplace_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  listByHousehold(
    request: marketplace_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: marketplace_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<marketplace_pb.JsonResponse>;

  getShortlistCount(
    request: marketplace_pb.UserIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: marketplace_pb.CountResponse) => void
  ): grpcWeb.ClientReadableStream<marketplace_pb.CountResponse>;

}

export class HireRequestServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  listHireRequests(
    request: marketplace_pb.ListHireRequestsReq,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: marketplace_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<marketplace_pb.JsonResponse>;

  acceptHireRequest(
    request: marketplace_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: marketplace_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<marketplace_pb.JsonResponse>;

  declineHireRequest(
    request: marketplace_pb.IdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: marketplace_pb.JsonResponse) => void
  ): grpcWeb.ClientReadableStream<marketplace_pb.JsonResponse>;

}

export class ShortlistServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createShortlist(
    request: marketplace_pb.CreateShortlistReq,
    metadata?: grpcWeb.Metadata
  ): Promise<marketplace_pb.JsonResponse>;

  deleteShortlist(
    request: marketplace_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  listByHousehold(
    request: marketplace_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<marketplace_pb.JsonResponse>;

  getShortlistCount(
    request: marketplace_pb.UserIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<marketplace_pb.CountResponse>;

}

export class HireRequestServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  listHireRequests(
    request: marketplace_pb.ListHireRequestsReq,
    metadata?: grpcWeb.Metadata
  ): Promise<marketplace_pb.JsonResponse>;

  acceptHireRequest(
    request: marketplace_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<marketplace_pb.JsonResponse>;

  declineHireRequest(
    request: marketplace_pb.IdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<marketplace_pb.JsonResponse>;

}

