import * as grpcWeb from 'grpc-web';

import * as client_profile_client_profile_pb from '../client_profile/client_profile_pb'; // proto import: "client_profile/client_profile.proto"
import * as shared_shared_pb from '../shared/shared_pb'; // proto import: "shared/shared.proto"


export class ClientProfileServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createJobType(
    request: client_profile_client_profile_pb.CreateJobTypeRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  getJobType(
    request: client_profile_client_profile_pb.JobTypeIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  listJobTypes(
    request: client_profile_client_profile_pb.ListJobTypesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  attachJobTypeFeatures(
    request: client_profile_client_profile_pb.AttachJobTypeFeaturesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  replaceJobTypeFeatures(
    request: client_profile_client_profile_pb.AttachJobTypeFeaturesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  detachJobTypeFeature(
    request: client_profile_client_profile_pb.DetachJobTypeFeatureRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  listJobTypeFeatures(
    request: client_profile_client_profile_pb.JobTypeIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  getJobTypeFeatureBundles(
    request: client_profile_client_profile_pb.JobTypeIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  saveListingFeatureProperties(
    request: client_profile_client_profile_pb.SaveListingFeaturePropertiesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  replaceListingFeatureProperties(
    request: client_profile_client_profile_pb.SaveListingFeaturePropertiesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  getListingFeatureProperties(
    request: client_profile_client_profile_pb.ListingIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  removeListingFeatureProperty(
    request: client_profile_client_profile_pb.ListingFeaturePropertyIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

  matchCandidates(
    request: client_profile_client_profile_pb.ListingIdRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: shared_shared_pb.GenericResponse) => void
  ): grpcWeb.ClientReadableStream<shared_shared_pb.GenericResponse>;

}

export class ClientProfileServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createJobType(
    request: client_profile_client_profile_pb.CreateJobTypeRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  getJobType(
    request: client_profile_client_profile_pb.JobTypeIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  listJobTypes(
    request: client_profile_client_profile_pb.ListJobTypesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  attachJobTypeFeatures(
    request: client_profile_client_profile_pb.AttachJobTypeFeaturesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  replaceJobTypeFeatures(
    request: client_profile_client_profile_pb.AttachJobTypeFeaturesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  detachJobTypeFeature(
    request: client_profile_client_profile_pb.DetachJobTypeFeatureRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  listJobTypeFeatures(
    request: client_profile_client_profile_pb.JobTypeIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  getJobTypeFeatureBundles(
    request: client_profile_client_profile_pb.JobTypeIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  saveListingFeatureProperties(
    request: client_profile_client_profile_pb.SaveListingFeaturePropertiesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  replaceListingFeatureProperties(
    request: client_profile_client_profile_pb.SaveListingFeaturePropertiesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  getListingFeatureProperties(
    request: client_profile_client_profile_pb.ListingIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  removeListingFeatureProperty(
    request: client_profile_client_profile_pb.ListingFeaturePropertyIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

  matchCandidates(
    request: client_profile_client_profile_pb.ListingIdRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<shared_shared_pb.GenericResponse>;

}

