import * as grpcWeb from 'grpc-web';

import * as subscription_pb from './subscription_pb'; // proto import: "subscription.proto"


export class PaymentsServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getMySubscription(
    request: subscription_pb.GetMySubscriptionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: subscription_pb.GetMySubscriptionResponse) => void
  ): grpcWeb.ClientReadableStream<subscription_pb.GetMySubscriptionResponse>;

  checkSubscriptionAccess(
    request: subscription_pb.CheckSubscriptionAccessRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: subscription_pb.CheckSubscriptionAccessResponse) => void
  ): grpcWeb.ClientReadableStream<subscription_pb.CheckSubscriptionAccessResponse>;

}

export class PaymentsServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  getMySubscription(
    request: subscription_pb.GetMySubscriptionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<subscription_pb.GetMySubscriptionResponse>;

  checkSubscriptionAccess(
    request: subscription_pb.CheckSubscriptionAccessRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<subscription_pb.CheckSubscriptionAccessResponse>;

}

