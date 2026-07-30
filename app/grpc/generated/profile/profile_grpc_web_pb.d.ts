import * as grpcWeb from 'grpc-web';

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"
import * as profile_profile_pb from '../profile/profile_pb'; // proto import: "profile/profile.proto"
import * as shared_shared_pb from '../shared/shared_pb'; // proto import: "shared/shared.proto"


export class ProfileServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createProfile(
    request: profile_profile_pb.CreateProfileRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  linkFeatures(
    request: profile_profile_pb.LinkProfileFeature,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  updateProfileFeatures(
    request: profile_profile_pb.LinkProfileFeature,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  getProfileFeatures(
    request: profile_profile_pb.GetProfileFeature,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  getProfiles(
    request: profile_profile_pb.GetProfileFeature,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  listProfiles(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

}

export class ProfileServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createProfile(
    request: profile_profile_pb.CreateProfileRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  linkFeatures(
    request: profile_profile_pb.LinkProfileFeature,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  updateProfileFeatures(
    request: profile_profile_pb.LinkProfileFeature,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  getProfileFeatures(
    request: profile_profile_pb.GetProfileFeature,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  getProfiles(
    request: profile_profile_pb.GetProfileFeature,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  listProfiles(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

}

