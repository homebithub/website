import * as jspb from 'google-protobuf'

import * as google_protobuf_struct_pb from 'google-protobuf/google/protobuf/struct_pb'; // proto import: "google/protobuf/struct.proto"


export class JsonResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): JsonResponse;
  hasData(): boolean;
  clearData(): JsonResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JsonResponse.AsObject;
  static toObject(includeInstance: boolean, msg: JsonResponse): JsonResponse.AsObject;
  static serializeBinaryToWriter(message: JsonResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JsonResponse;
  static deserializeBinaryFromReader(message: JsonResponse, reader: jspb.BinaryReader): JsonResponse;
}

export namespace JsonResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class ListTemplatesRequest extends jspb.Message {
  getLimit(): number;
  setLimit(value: number): ListTemplatesRequest;

  getOffset(): number;
  setOffset(value: number): ListTemplatesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListTemplatesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListTemplatesRequest): ListTemplatesRequest.AsObject;
  static serializeBinaryToWriter(message: ListTemplatesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListTemplatesRequest;
  static deserializeBinaryFromReader(message: ListTemplatesRequest, reader: jspb.BinaryReader): ListTemplatesRequest;
}

export namespace ListTemplatesRequest {
  export type AsObject = {
    limit: number;
    offset: number;
  };
}

export class ListTemplatesResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): ListTemplatesResponse;
  hasData(): boolean;
  clearData(): ListTemplatesResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListTemplatesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListTemplatesResponse): ListTemplatesResponse.AsObject;
  static serializeBinaryToWriter(message: ListTemplatesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListTemplatesResponse;
  static deserializeBinaryFromReader(message: ListTemplatesResponse, reader: jspb.BinaryReader): ListTemplatesResponse;
}

export namespace ListTemplatesResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class CreateTemplateRequest extends jspb.Message {
  getName(): string;
  setName(value: string): CreateTemplateRequest;

  getDescription(): string;
  setDescription(value: string): CreateTemplateRequest;

  getSubject(): string;
  setSubject(value: string): CreateTemplateRequest;

  getVariant(): string;
  setVariant(value: string): CreateTemplateRequest;

  getCategory(): string;
  setCategory(value: string): CreateTemplateRequest;

  getVariables(): google_protobuf_struct_pb.Struct | undefined;
  setVariables(value?: google_protobuf_struct_pb.Struct): CreateTemplateRequest;
  hasVariables(): boolean;
  clearVariables(): CreateTemplateRequest;

  getChannels(): google_protobuf_struct_pb.Struct | undefined;
  setChannels(value?: google_protobuf_struct_pb.Struct): CreateTemplateRequest;
  hasChannels(): boolean;
  clearChannels(): CreateTemplateRequest;

  getCreatedBy(): string;
  setCreatedBy(value: string): CreateTemplateRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateTemplateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateTemplateRequest): CreateTemplateRequest.AsObject;
  static serializeBinaryToWriter(message: CreateTemplateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateTemplateRequest;
  static deserializeBinaryFromReader(message: CreateTemplateRequest, reader: jspb.BinaryReader): CreateTemplateRequest;
}

export namespace CreateTemplateRequest {
  export type AsObject = {
    name: string;
    description: string;
    subject: string;
    variant: string;
    category: string;
    variables?: google_protobuf_struct_pb.Struct.AsObject;
    channels?: google_protobuf_struct_pb.Struct.AsObject;
    createdBy: string;
  };
}

export class CreateTemplateResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): CreateTemplateResponse;
  hasData(): boolean;
  clearData(): CreateTemplateResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateTemplateResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CreateTemplateResponse): CreateTemplateResponse.AsObject;
  static serializeBinaryToWriter(message: CreateTemplateResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateTemplateResponse;
  static deserializeBinaryFromReader(message: CreateTemplateResponse, reader: jspb.BinaryReader): CreateTemplateResponse;
}

export namespace CreateTemplateResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class GetTemplateRequest extends jspb.Message {
  getId(): string;
  setId(value: string): GetTemplateRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTemplateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetTemplateRequest): GetTemplateRequest.AsObject;
  static serializeBinaryToWriter(message: GetTemplateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTemplateRequest;
  static deserializeBinaryFromReader(message: GetTemplateRequest, reader: jspb.BinaryReader): GetTemplateRequest;
}

export namespace GetTemplateRequest {
  export type AsObject = {
    id: string;
  };
}

export class GetTemplateResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): GetTemplateResponse;
  hasData(): boolean;
  clearData(): GetTemplateResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTemplateResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetTemplateResponse): GetTemplateResponse.AsObject;
  static serializeBinaryToWriter(message: GetTemplateResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTemplateResponse;
  static deserializeBinaryFromReader(message: GetTemplateResponse, reader: jspb.BinaryReader): GetTemplateResponse;
}

export namespace GetTemplateResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class UpdateTemplateRequest extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateTemplateRequest;

  getName(): string;
  setName(value: string): UpdateTemplateRequest;

  getDescription(): string;
  setDescription(value: string): UpdateTemplateRequest;

  getSubject(): string;
  setSubject(value: string): UpdateTemplateRequest;

  getVariant(): string;
  setVariant(value: string): UpdateTemplateRequest;

  getCategory(): string;
  setCategory(value: string): UpdateTemplateRequest;

  getVariables(): google_protobuf_struct_pb.Struct | undefined;
  setVariables(value?: google_protobuf_struct_pb.Struct): UpdateTemplateRequest;
  hasVariables(): boolean;
  clearVariables(): UpdateTemplateRequest;

  getChannels(): google_protobuf_struct_pb.Struct | undefined;
  setChannels(value?: google_protobuf_struct_pb.Struct): UpdateTemplateRequest;
  hasChannels(): boolean;
  clearChannels(): UpdateTemplateRequest;

  getStatus(): string;
  setStatus(value: string): UpdateTemplateRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTemplateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTemplateRequest): UpdateTemplateRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateTemplateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTemplateRequest;
  static deserializeBinaryFromReader(message: UpdateTemplateRequest, reader: jspb.BinaryReader): UpdateTemplateRequest;
}

export namespace UpdateTemplateRequest {
  export type AsObject = {
    id: string;
    name: string;
    description: string;
    subject: string;
    variant: string;
    category: string;
    variables?: google_protobuf_struct_pb.Struct.AsObject;
    channels?: google_protobuf_struct_pb.Struct.AsObject;
    status: string;
  };
}

export class UpdateTemplateResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdateTemplateResponse;
  hasData(): boolean;
  clearData(): UpdateTemplateResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTemplateResponse.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTemplateResponse): UpdateTemplateResponse.AsObject;
  static serializeBinaryToWriter(message: UpdateTemplateResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTemplateResponse;
  static deserializeBinaryFromReader(message: UpdateTemplateResponse, reader: jspb.BinaryReader): UpdateTemplateResponse;
}

export namespace UpdateTemplateResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class DeleteTemplateRequest extends jspb.Message {
  getId(): string;
  setId(value: string): DeleteTemplateRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteTemplateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteTemplateRequest): DeleteTemplateRequest.AsObject;
  static serializeBinaryToWriter(message: DeleteTemplateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteTemplateRequest;
  static deserializeBinaryFromReader(message: DeleteTemplateRequest, reader: jspb.BinaryReader): DeleteTemplateRequest;
}

export namespace DeleteTemplateRequest {
  export type AsObject = {
    id: string;
  };
}

export class DeleteTemplateResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): DeleteTemplateResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteTemplateResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteTemplateResponse): DeleteTemplateResponse.AsObject;
  static serializeBinaryToWriter(message: DeleteTemplateResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteTemplateResponse;
  static deserializeBinaryFromReader(message: DeleteTemplateResponse, reader: jspb.BinaryReader): DeleteTemplateResponse;
}

export namespace DeleteTemplateResponse {
  export type AsObject = {
    message: string;
  };
}

export class PreviewTemplateRequest extends jspb.Message {
  getId(): string;
  setId(value: string): PreviewTemplateRequest;

  getVariables(): google_protobuf_struct_pb.Struct | undefined;
  setVariables(value?: google_protobuf_struct_pb.Struct): PreviewTemplateRequest;
  hasVariables(): boolean;
  clearVariables(): PreviewTemplateRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PreviewTemplateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PreviewTemplateRequest): PreviewTemplateRequest.AsObject;
  static serializeBinaryToWriter(message: PreviewTemplateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PreviewTemplateRequest;
  static deserializeBinaryFromReader(message: PreviewTemplateRequest, reader: jspb.BinaryReader): PreviewTemplateRequest;
}

export namespace PreviewTemplateRequest {
  export type AsObject = {
    id: string;
    variables?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class PreviewTemplateResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): PreviewTemplateResponse;
  hasData(): boolean;
  clearData(): PreviewTemplateResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PreviewTemplateResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PreviewTemplateResponse): PreviewTemplateResponse.AsObject;
  static serializeBinaryToWriter(message: PreviewTemplateResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PreviewTemplateResponse;
  static deserializeBinaryFromReader(message: PreviewTemplateResponse, reader: jspb.BinaryReader): PreviewTemplateResponse;
}

export namespace PreviewTemplateResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class SendNotificationRequest extends jspb.Message {
  getTemplateId(): string;
  setTemplateId(value: string): SendNotificationRequest;

  getUserId(): string;
  setUserId(value: string): SendNotificationRequest;

  getVariables(): google_protobuf_struct_pb.Struct | undefined;
  setVariables(value?: google_protobuf_struct_pb.Struct): SendNotificationRequest;
  hasVariables(): boolean;
  clearVariables(): SendNotificationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendNotificationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendNotificationRequest): SendNotificationRequest.AsObject;
  static serializeBinaryToWriter(message: SendNotificationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendNotificationRequest;
  static deserializeBinaryFromReader(message: SendNotificationRequest, reader: jspb.BinaryReader): SendNotificationRequest;
}

export namespace SendNotificationRequest {
  export type AsObject = {
    templateId: string;
    userId: string;
    variables?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class SendNotificationResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): SendNotificationResponse;
  hasData(): boolean;
  clearData(): SendNotificationResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendNotificationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SendNotificationResponse): SendNotificationResponse.AsObject;
  static serializeBinaryToWriter(message: SendNotificationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendNotificationResponse;
  static deserializeBinaryFromReader(message: SendNotificationResponse, reader: jspb.BinaryReader): SendNotificationResponse;
}

export namespace SendNotificationResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class GetNotificationRequest extends jspb.Message {
  getId(): string;
  setId(value: string): GetNotificationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetNotificationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetNotificationRequest): GetNotificationRequest.AsObject;
  static serializeBinaryToWriter(message: GetNotificationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetNotificationRequest;
  static deserializeBinaryFromReader(message: GetNotificationRequest, reader: jspb.BinaryReader): GetNotificationRequest;
}

export namespace GetNotificationRequest {
  export type AsObject = {
    id: string;
  };
}

export class GetNotificationResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): GetNotificationResponse;
  hasData(): boolean;
  clearData(): GetNotificationResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetNotificationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetNotificationResponse): GetNotificationResponse.AsObject;
  static serializeBinaryToWriter(message: GetNotificationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetNotificationResponse;
  static deserializeBinaryFromReader(message: GetNotificationResponse, reader: jspb.BinaryReader): GetNotificationResponse;
}

export namespace GetNotificationResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class ListNotificationsByUserRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): ListNotificationsByUserRequest;

  getLimit(): number;
  setLimit(value: number): ListNotificationsByUserRequest;

  getOffset(): number;
  setOffset(value: number): ListNotificationsByUserRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListNotificationsByUserRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListNotificationsByUserRequest): ListNotificationsByUserRequest.AsObject;
  static serializeBinaryToWriter(message: ListNotificationsByUserRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListNotificationsByUserRequest;
  static deserializeBinaryFromReader(message: ListNotificationsByUserRequest, reader: jspb.BinaryReader): ListNotificationsByUserRequest;
}

export namespace ListNotificationsByUserRequest {
  export type AsObject = {
    userId: string;
    limit: number;
    offset: number;
  };
}

export class ListNotificationsByUserResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): ListNotificationsByUserResponse;
  hasData(): boolean;
  clearData(): ListNotificationsByUserResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListNotificationsByUserResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListNotificationsByUserResponse): ListNotificationsByUserResponse.AsObject;
  static serializeBinaryToWriter(message: ListNotificationsByUserResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListNotificationsByUserResponse;
  static deserializeBinaryFromReader(message: ListNotificationsByUserResponse, reader: jspb.BinaryReader): ListNotificationsByUserResponse;
}

export namespace ListNotificationsByUserResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class MarkNotificationAsClickedRequest extends jspb.Message {
  getNotificationId(): string;
  setNotificationId(value: string): MarkNotificationAsClickedRequest;

  getUserId(): string;
  setUserId(value: string): MarkNotificationAsClickedRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MarkNotificationAsClickedRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MarkNotificationAsClickedRequest): MarkNotificationAsClickedRequest.AsObject;
  static serializeBinaryToWriter(message: MarkNotificationAsClickedRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MarkNotificationAsClickedRequest;
  static deserializeBinaryFromReader(message: MarkNotificationAsClickedRequest, reader: jspb.BinaryReader): MarkNotificationAsClickedRequest;
}

export namespace MarkNotificationAsClickedRequest {
  export type AsObject = {
    notificationId: string;
    userId: string;
  };
}

export class MarkNotificationAsClickedResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): MarkNotificationAsClickedResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MarkNotificationAsClickedResponse.AsObject;
  static toObject(includeInstance: boolean, msg: MarkNotificationAsClickedResponse): MarkNotificationAsClickedResponse.AsObject;
  static serializeBinaryToWriter(message: MarkNotificationAsClickedResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MarkNotificationAsClickedResponse;
  static deserializeBinaryFromReader(message: MarkNotificationAsClickedResponse, reader: jspb.BinaryReader): MarkNotificationAsClickedResponse;
}

export namespace MarkNotificationAsClickedResponse {
  export type AsObject = {
    message: string;
  };
}

export class MarkAllNotificationsAsClickedRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): MarkAllNotificationsAsClickedRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MarkAllNotificationsAsClickedRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MarkAllNotificationsAsClickedRequest): MarkAllNotificationsAsClickedRequest.AsObject;
  static serializeBinaryToWriter(message: MarkAllNotificationsAsClickedRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MarkAllNotificationsAsClickedRequest;
  static deserializeBinaryFromReader(message: MarkAllNotificationsAsClickedRequest, reader: jspb.BinaryReader): MarkAllNotificationsAsClickedRequest;
}

export namespace MarkAllNotificationsAsClickedRequest {
  export type AsObject = {
    userId: string;
  };
}

export class MarkAllNotificationsAsClickedResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): MarkAllNotificationsAsClickedResponse;

  getCount(): number;
  setCount(value: number): MarkAllNotificationsAsClickedResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MarkAllNotificationsAsClickedResponse.AsObject;
  static toObject(includeInstance: boolean, msg: MarkAllNotificationsAsClickedResponse): MarkAllNotificationsAsClickedResponse.AsObject;
  static serializeBinaryToWriter(message: MarkAllNotificationsAsClickedResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MarkAllNotificationsAsClickedResponse;
  static deserializeBinaryFromReader(message: MarkAllNotificationsAsClickedResponse, reader: jspb.BinaryReader): MarkAllNotificationsAsClickedResponse;
}

export namespace MarkAllNotificationsAsClickedResponse {
  export type AsObject = {
    message: string;
    count: number;
  };
}

export class GetDeliveryRequest extends jspb.Message {
  getId(): string;
  setId(value: string): GetDeliveryRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDeliveryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetDeliveryRequest): GetDeliveryRequest.AsObject;
  static serializeBinaryToWriter(message: GetDeliveryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDeliveryRequest;
  static deserializeBinaryFromReader(message: GetDeliveryRequest, reader: jspb.BinaryReader): GetDeliveryRequest;
}

export namespace GetDeliveryRequest {
  export type AsObject = {
    id: string;
  };
}

export class GetDeliveryResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): GetDeliveryResponse;
  hasData(): boolean;
  clearData(): GetDeliveryResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDeliveryResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetDeliveryResponse): GetDeliveryResponse.AsObject;
  static serializeBinaryToWriter(message: GetDeliveryResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDeliveryResponse;
  static deserializeBinaryFromReader(message: GetDeliveryResponse, reader: jspb.BinaryReader): GetDeliveryResponse;
}

export namespace GetDeliveryResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class ListDeliveriesRequest extends jspb.Message {
  getLimit(): number;
  setLimit(value: number): ListDeliveriesRequest;

  getOffset(): number;
  setOffset(value: number): ListDeliveriesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListDeliveriesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListDeliveriesRequest): ListDeliveriesRequest.AsObject;
  static serializeBinaryToWriter(message: ListDeliveriesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListDeliveriesRequest;
  static deserializeBinaryFromReader(message: ListDeliveriesRequest, reader: jspb.BinaryReader): ListDeliveriesRequest;
}

export namespace ListDeliveriesRequest {
  export type AsObject = {
    limit: number;
    offset: number;
  };
}

export class ListDeliveriesResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): ListDeliveriesResponse;
  hasData(): boolean;
  clearData(): ListDeliveriesResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListDeliveriesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListDeliveriesResponse): ListDeliveriesResponse.AsObject;
  static serializeBinaryToWriter(message: ListDeliveriesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListDeliveriesResponse;
  static deserializeBinaryFromReader(message: ListDeliveriesResponse, reader: jspb.BinaryReader): ListDeliveriesResponse;
}

export namespace ListDeliveriesResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class CreateBlastRequest extends jspb.Message {
  getName(): string;
  setName(value: string): CreateBlastRequest;

  getDescription(): string;
  setDescription(value: string): CreateBlastRequest;

  getTemplateId(): string;
  setTemplateId(value: string): CreateBlastRequest;

  getSegmentCriteria(): google_protobuf_struct_pb.Struct | undefined;
  setSegmentCriteria(value?: google_protobuf_struct_pb.Struct): CreateBlastRequest;
  hasSegmentCriteria(): boolean;
  clearSegmentCriteria(): CreateBlastRequest;

  getScheduledAt(): string;
  setScheduledAt(value: string): CreateBlastRequest;

  getCreatedBy(): string;
  setCreatedBy(value: string): CreateBlastRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateBlastRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateBlastRequest): CreateBlastRequest.AsObject;
  static serializeBinaryToWriter(message: CreateBlastRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateBlastRequest;
  static deserializeBinaryFromReader(message: CreateBlastRequest, reader: jspb.BinaryReader): CreateBlastRequest;
}

export namespace CreateBlastRequest {
  export type AsObject = {
    name: string;
    description: string;
    templateId: string;
    segmentCriteria?: google_protobuf_struct_pb.Struct.AsObject;
    scheduledAt: string;
    createdBy: string;
  };
}

export class CreateBlastResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): CreateBlastResponse;
  hasData(): boolean;
  clearData(): CreateBlastResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateBlastResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CreateBlastResponse): CreateBlastResponse.AsObject;
  static serializeBinaryToWriter(message: CreateBlastResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateBlastResponse;
  static deserializeBinaryFromReader(message: CreateBlastResponse, reader: jspb.BinaryReader): CreateBlastResponse;
}

export namespace CreateBlastResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class GetBlastRequest extends jspb.Message {
  getId(): string;
  setId(value: string): GetBlastRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetBlastRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetBlastRequest): GetBlastRequest.AsObject;
  static serializeBinaryToWriter(message: GetBlastRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetBlastRequest;
  static deserializeBinaryFromReader(message: GetBlastRequest, reader: jspb.BinaryReader): GetBlastRequest;
}

export namespace GetBlastRequest {
  export type AsObject = {
    id: string;
  };
}

export class GetBlastResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): GetBlastResponse;
  hasData(): boolean;
  clearData(): GetBlastResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetBlastResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetBlastResponse): GetBlastResponse.AsObject;
  static serializeBinaryToWriter(message: GetBlastResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetBlastResponse;
  static deserializeBinaryFromReader(message: GetBlastResponse, reader: jspb.BinaryReader): GetBlastResponse;
}

export namespace GetBlastResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class ListBlastsRequest extends jspb.Message {
  getLimit(): number;
  setLimit(value: number): ListBlastsRequest;

  getOffset(): number;
  setOffset(value: number): ListBlastsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListBlastsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListBlastsRequest): ListBlastsRequest.AsObject;
  static serializeBinaryToWriter(message: ListBlastsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListBlastsRequest;
  static deserializeBinaryFromReader(message: ListBlastsRequest, reader: jspb.BinaryReader): ListBlastsRequest;
}

export namespace ListBlastsRequest {
  export type AsObject = {
    limit: number;
    offset: number;
  };
}

export class ListBlastsResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): ListBlastsResponse;
  hasData(): boolean;
  clearData(): ListBlastsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListBlastsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListBlastsResponse): ListBlastsResponse.AsObject;
  static serializeBinaryToWriter(message: ListBlastsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListBlastsResponse;
  static deserializeBinaryFromReader(message: ListBlastsResponse, reader: jspb.BinaryReader): ListBlastsResponse;
}

export namespace ListBlastsResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class BlastActionRequest extends jspb.Message {
  getId(): string;
  setId(value: string): BlastActionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlastActionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BlastActionRequest): BlastActionRequest.AsObject;
  static serializeBinaryToWriter(message: BlastActionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlastActionRequest;
  static deserializeBinaryFromReader(message: BlastActionRequest, reader: jspb.BinaryReader): BlastActionRequest;
}

export namespace BlastActionRequest {
  export type AsObject = {
    id: string;
  };
}

export class BlastActionResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): BlastActionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlastActionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: BlastActionResponse): BlastActionResponse.AsObject;
  static serializeBinaryToWriter(message: BlastActionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlastActionResponse;
  static deserializeBinaryFromReader(message: BlastActionResponse, reader: jspb.BinaryReader): BlastActionResponse;
}

export namespace BlastActionResponse {
  export type AsObject = {
    message: string;
  };
}

export class GetUserPreferencesRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): GetUserPreferencesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetUserPreferencesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetUserPreferencesRequest): GetUserPreferencesRequest.AsObject;
  static serializeBinaryToWriter(message: GetUserPreferencesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetUserPreferencesRequest;
  static deserializeBinaryFromReader(message: GetUserPreferencesRequest, reader: jspb.BinaryReader): GetUserPreferencesRequest;
}

export namespace GetUserPreferencesRequest {
  export type AsObject = {
    userId: string;
  };
}

export class GetUserPreferencesResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): GetUserPreferencesResponse;
  hasData(): boolean;
  clearData(): GetUserPreferencesResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetUserPreferencesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetUserPreferencesResponse): GetUserPreferencesResponse.AsObject;
  static serializeBinaryToWriter(message: GetUserPreferencesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetUserPreferencesResponse;
  static deserializeBinaryFromReader(message: GetUserPreferencesResponse, reader: jspb.BinaryReader): GetUserPreferencesResponse;
}

export namespace GetUserPreferencesResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class UpdateUserPreferencesRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UpdateUserPreferencesRequest;

  getPreferences(): google_protobuf_struct_pb.Struct | undefined;
  setPreferences(value?: google_protobuf_struct_pb.Struct): UpdateUserPreferencesRequest;
  hasPreferences(): boolean;
  clearPreferences(): UpdateUserPreferencesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateUserPreferencesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateUserPreferencesRequest): UpdateUserPreferencesRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateUserPreferencesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateUserPreferencesRequest;
  static deserializeBinaryFromReader(message: UpdateUserPreferencesRequest, reader: jspb.BinaryReader): UpdateUserPreferencesRequest;
}

export namespace UpdateUserPreferencesRequest {
  export type AsObject = {
    userId: string;
    preferences?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class UpdateUserPreferencesResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdateUserPreferencesResponse;
  hasData(): boolean;
  clearData(): UpdateUserPreferencesResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateUserPreferencesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateUserPreferencesResponse): UpdateUserPreferencesResponse.AsObject;
  static serializeBinaryToWriter(message: UpdateUserPreferencesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateUserPreferencesResponse;
  static deserializeBinaryFromReader(message: UpdateUserPreferencesResponse, reader: jspb.BinaryReader): UpdateUserPreferencesResponse;
}

export namespace UpdateUserPreferencesResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class RegisterPushTokenRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): RegisterPushTokenRequest;

  getToken(): string;
  setToken(value: string): RegisterPushTokenRequest;

  getPlatform(): string;
  setPlatform(value: string): RegisterPushTokenRequest;

  getDeviceId(): string;
  setDeviceId(value: string): RegisterPushTokenRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RegisterPushTokenRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RegisterPushTokenRequest): RegisterPushTokenRequest.AsObject;
  static serializeBinaryToWriter(message: RegisterPushTokenRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RegisterPushTokenRequest;
  static deserializeBinaryFromReader(message: RegisterPushTokenRequest, reader: jspb.BinaryReader): RegisterPushTokenRequest;
}

export namespace RegisterPushTokenRequest {
  export type AsObject = {
    userId: string;
    token: string;
    platform: string;
    deviceId: string;
  };
}

export class RegisterPushTokenResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): RegisterPushTokenResponse;
  hasData(): boolean;
  clearData(): RegisterPushTokenResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RegisterPushTokenResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RegisterPushTokenResponse): RegisterPushTokenResponse.AsObject;
  static serializeBinaryToWriter(message: RegisterPushTokenResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RegisterPushTokenResponse;
  static deserializeBinaryFromReader(message: RegisterPushTokenResponse, reader: jspb.BinaryReader): RegisterPushTokenResponse;
}

export namespace RegisterPushTokenResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class GetPushTokensRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): GetPushTokensRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPushTokensRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPushTokensRequest): GetPushTokensRequest.AsObject;
  static serializeBinaryToWriter(message: GetPushTokensRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPushTokensRequest;
  static deserializeBinaryFromReader(message: GetPushTokensRequest, reader: jspb.BinaryReader): GetPushTokensRequest;
}

export namespace GetPushTokensRequest {
  export type AsObject = {
    userId: string;
  };
}

export class GetPushTokensResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): GetPushTokensResponse;
  hasData(): boolean;
  clearData(): GetPushTokensResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPushTokensResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetPushTokensResponse): GetPushTokensResponse.AsObject;
  static serializeBinaryToWriter(message: GetPushTokensResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPushTokensResponse;
  static deserializeBinaryFromReader(message: GetPushTokensResponse, reader: jspb.BinaryReader): GetPushTokensResponse;
}

export namespace GetPushTokensResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class DeletePushTokenRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): DeletePushTokenRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeletePushTokenRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DeletePushTokenRequest): DeletePushTokenRequest.AsObject;
  static serializeBinaryToWriter(message: DeletePushTokenRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeletePushTokenRequest;
  static deserializeBinaryFromReader(message: DeletePushTokenRequest, reader: jspb.BinaryReader): DeletePushTokenRequest;
}

export namespace DeletePushTokenRequest {
  export type AsObject = {
    userId: string;
  };
}

export class DeletePushTokenResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): DeletePushTokenResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeletePushTokenResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DeletePushTokenResponse): DeletePushTokenResponse.AsObject;
  static serializeBinaryToWriter(message: DeletePushTokenResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeletePushTokenResponse;
  static deserializeBinaryFromReader(message: DeletePushTokenResponse, reader: jspb.BinaryReader): DeletePushTokenResponse;
}

export namespace DeletePushTokenResponse {
  export type AsObject = {
    message: string;
  };
}

export class GetBlastStatusRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetBlastStatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetBlastStatusRequest): GetBlastStatusRequest.AsObject;
  static serializeBinaryToWriter(message: GetBlastStatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetBlastStatusRequest;
  static deserializeBinaryFromReader(message: GetBlastStatusRequest, reader: jspb.BinaryReader): GetBlastStatusRequest;
}

export namespace GetBlastStatusRequest {
  export type AsObject = {
  };
}

export class GetBlastStatusResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): GetBlastStatusResponse;
  hasData(): boolean;
  clearData(): GetBlastStatusResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetBlastStatusResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetBlastStatusResponse): GetBlastStatusResponse.AsObject;
  static serializeBinaryToWriter(message: GetBlastStatusResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetBlastStatusResponse;
  static deserializeBinaryFromReader(message: GetBlastStatusResponse, reader: jspb.BinaryReader): GetBlastStatusResponse;
}

export namespace GetBlastStatusResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class ToggleFeatureFlagRequest extends jspb.Message {
  getKey(): string;
  setKey(value: string): ToggleFeatureFlagRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ToggleFeatureFlagRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ToggleFeatureFlagRequest): ToggleFeatureFlagRequest.AsObject;
  static serializeBinaryToWriter(message: ToggleFeatureFlagRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ToggleFeatureFlagRequest;
  static deserializeBinaryFromReader(message: ToggleFeatureFlagRequest, reader: jspb.BinaryReader): ToggleFeatureFlagRequest;
}

export namespace ToggleFeatureFlagRequest {
  export type AsObject = {
    key: string;
  };
}

export class ToggleFeatureFlagResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): ToggleFeatureFlagResponse;
  hasData(): boolean;
  clearData(): ToggleFeatureFlagResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ToggleFeatureFlagResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ToggleFeatureFlagResponse): ToggleFeatureFlagResponse.AsObject;
  static serializeBinaryToWriter(message: ToggleFeatureFlagResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ToggleFeatureFlagResponse;
  static deserializeBinaryFromReader(message: ToggleFeatureFlagResponse, reader: jspb.BinaryReader): ToggleFeatureFlagResponse;
}

export namespace ToggleFeatureFlagResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class GetDeliveryStatsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDeliveryStatsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetDeliveryStatsRequest): GetDeliveryStatsRequest.AsObject;
  static serializeBinaryToWriter(message: GetDeliveryStatsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDeliveryStatsRequest;
  static deserializeBinaryFromReader(message: GetDeliveryStatsRequest, reader: jspb.BinaryReader): GetDeliveryStatsRequest;
}

export namespace GetDeliveryStatsRequest {
  export type AsObject = {
  };
}

export class GetDeliveryStatsResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): GetDeliveryStatsResponse;
  hasData(): boolean;
  clearData(): GetDeliveryStatsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDeliveryStatsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetDeliveryStatsResponse): GetDeliveryStatsResponse.AsObject;
  static serializeBinaryToWriter(message: GetDeliveryStatsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDeliveryStatsResponse;
  static deserializeBinaryFromReader(message: GetDeliveryStatsResponse, reader: jspb.BinaryReader): GetDeliveryStatsResponse;
}

export namespace GetDeliveryStatsResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class GetChannelPerformanceRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetChannelPerformanceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetChannelPerformanceRequest): GetChannelPerformanceRequest.AsObject;
  static serializeBinaryToWriter(message: GetChannelPerformanceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetChannelPerformanceRequest;
  static deserializeBinaryFromReader(message: GetChannelPerformanceRequest, reader: jspb.BinaryReader): GetChannelPerformanceRequest;
}

export namespace GetChannelPerformanceRequest {
  export type AsObject = {
  };
}

export class GetChannelPerformanceResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): GetChannelPerformanceResponse;
  hasData(): boolean;
  clearData(): GetChannelPerformanceResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetChannelPerformanceResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetChannelPerformanceResponse): GetChannelPerformanceResponse.AsObject;
  static serializeBinaryToWriter(message: GetChannelPerformanceResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetChannelPerformanceResponse;
  static deserializeBinaryFromReader(message: GetChannelPerformanceResponse, reader: jspb.BinaryReader): GetChannelPerformanceResponse;
}

export namespace GetChannelPerformanceResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class StartConversationRequest extends jspb.Message {
  getHouseholdUserId(): string;
  setHouseholdUserId(value: string): StartConversationRequest;

  getHousehelpUserId(): string;
  setHousehelpUserId(value: string): StartConversationRequest;

  getHouseholdProfileId(): string;
  setHouseholdProfileId(value: string): StartConversationRequest;

  getHousehelpProfileId(): string;
  setHousehelpProfileId(value: string): StartConversationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartConversationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StartConversationRequest): StartConversationRequest.AsObject;
  static serializeBinaryToWriter(message: StartConversationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StartConversationRequest;
  static deserializeBinaryFromReader(message: StartConversationRequest, reader: jspb.BinaryReader): StartConversationRequest;
}

export namespace StartConversationRequest {
  export type AsObject = {
    householdUserId: string;
    househelpUserId: string;
    householdProfileId: string;
    househelpProfileId: string;
  };
}

export class StartConversationResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): StartConversationResponse;
  hasData(): boolean;
  clearData(): StartConversationResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StartConversationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StartConversationResponse): StartConversationResponse.AsObject;
  static serializeBinaryToWriter(message: StartConversationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StartConversationResponse;
  static deserializeBinaryFromReader(message: StartConversationResponse, reader: jspb.BinaryReader): StartConversationResponse;
}

export namespace StartConversationResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class ListConversationsRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): ListConversationsRequest;

  getOffset(): number;
  setOffset(value: number): ListConversationsRequest;

  getLimit(): number;
  setLimit(value: number): ListConversationsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListConversationsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListConversationsRequest): ListConversationsRequest.AsObject;
  static serializeBinaryToWriter(message: ListConversationsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListConversationsRequest;
  static deserializeBinaryFromReader(message: ListConversationsRequest, reader: jspb.BinaryReader): ListConversationsRequest;
}

export namespace ListConversationsRequest {
  export type AsObject = {
    userId: string;
    offset: number;
    limit: number;
  };
}

export class ListConversationsResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): ListConversationsResponse;
  hasData(): boolean;
  clearData(): ListConversationsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListConversationsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListConversationsResponse): ListConversationsResponse.AsObject;
  static serializeBinaryToWriter(message: ListConversationsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListConversationsResponse;
  static deserializeBinaryFromReader(message: ListConversationsResponse, reader: jspb.BinaryReader): ListConversationsResponse;
}

export namespace ListConversationsResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class GetConversationRequest extends jspb.Message {
  getId(): string;
  setId(value: string): GetConversationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetConversationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetConversationRequest): GetConversationRequest.AsObject;
  static serializeBinaryToWriter(message: GetConversationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetConversationRequest;
  static deserializeBinaryFromReader(message: GetConversationRequest, reader: jspb.BinaryReader): GetConversationRequest;
}

export namespace GetConversationRequest {
  export type AsObject = {
    id: string;
  };
}

export class GetConversationResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): GetConversationResponse;
  hasData(): boolean;
  clearData(): GetConversationResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetConversationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetConversationResponse): GetConversationResponse.AsObject;
  static serializeBinaryToWriter(message: GetConversationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetConversationResponse;
  static deserializeBinaryFromReader(message: GetConversationResponse, reader: jspb.BinaryReader): GetConversationResponse;
}

export namespace GetConversationResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class MarkConversationAsReadRequest extends jspb.Message {
  getConversationId(): string;
  setConversationId(value: string): MarkConversationAsReadRequest;

  getUserId(): string;
  setUserId(value: string): MarkConversationAsReadRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MarkConversationAsReadRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MarkConversationAsReadRequest): MarkConversationAsReadRequest.AsObject;
  static serializeBinaryToWriter(message: MarkConversationAsReadRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MarkConversationAsReadRequest;
  static deserializeBinaryFromReader(message: MarkConversationAsReadRequest, reader: jspb.BinaryReader): MarkConversationAsReadRequest;
}

export namespace MarkConversationAsReadRequest {
  export type AsObject = {
    conversationId: string;
    userId: string;
  };
}

export class MarkConversationAsReadResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): MarkConversationAsReadResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MarkConversationAsReadResponse.AsObject;
  static toObject(includeInstance: boolean, msg: MarkConversationAsReadResponse): MarkConversationAsReadResponse.AsObject;
  static serializeBinaryToWriter(message: MarkConversationAsReadResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MarkConversationAsReadResponse;
  static deserializeBinaryFromReader(message: MarkConversationAsReadResponse, reader: jspb.BinaryReader): MarkConversationAsReadResponse;
}

export namespace MarkConversationAsReadResponse {
  export type AsObject = {
    message: string;
  };
}

export class ListMessagesRequest extends jspb.Message {
  getConversationId(): string;
  setConversationId(value: string): ListMessagesRequest;

  getOffset(): number;
  setOffset(value: number): ListMessagesRequest;

  getLimit(): number;
  setLimit(value: number): ListMessagesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListMessagesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListMessagesRequest): ListMessagesRequest.AsObject;
  static serializeBinaryToWriter(message: ListMessagesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListMessagesRequest;
  static deserializeBinaryFromReader(message: ListMessagesRequest, reader: jspb.BinaryReader): ListMessagesRequest;
}

export namespace ListMessagesRequest {
  export type AsObject = {
    conversationId: string;
    offset: number;
    limit: number;
  };
}

export class ListMessagesResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): ListMessagesResponse;
  hasData(): boolean;
  clearData(): ListMessagesResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListMessagesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListMessagesResponse): ListMessagesResponse.AsObject;
  static serializeBinaryToWriter(message: ListMessagesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListMessagesResponse;
  static deserializeBinaryFromReader(message: ListMessagesResponse, reader: jspb.BinaryReader): ListMessagesResponse;
}

export namespace ListMessagesResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class SendMessageRequest extends jspb.Message {
  getConversationId(): string;
  setConversationId(value: string): SendMessageRequest;

  getUserId(): string;
  setUserId(value: string): SendMessageRequest;

  getBody(): string;
  setBody(value: string): SendMessageRequest;

  getReplyToId(): string;
  setReplyToId(value: string): SendMessageRequest;

  getSenderProfileId(): string;
  setSenderProfileId(value: string): SendMessageRequest;

  getSenderProfileType(): string;
  setSenderProfileType(value: string): SendMessageRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendMessageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendMessageRequest): SendMessageRequest.AsObject;
  static serializeBinaryToWriter(message: SendMessageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendMessageRequest;
  static deserializeBinaryFromReader(message: SendMessageRequest, reader: jspb.BinaryReader): SendMessageRequest;
}

export namespace SendMessageRequest {
  export type AsObject = {
    conversationId: string;
    userId: string;
    body: string;
    replyToId: string;
    senderProfileId: string;
    senderProfileType: string;
  };
}

export class SendMessageResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): SendMessageResponse;
  hasData(): boolean;
  clearData(): SendMessageResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendMessageResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SendMessageResponse): SendMessageResponse.AsObject;
  static serializeBinaryToWriter(message: SendMessageResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendMessageResponse;
  static deserializeBinaryFromReader(message: SendMessageResponse, reader: jspb.BinaryReader): SendMessageResponse;
}

export namespace SendMessageResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class EditMessageRequest extends jspb.Message {
  getMessageId(): string;
  setMessageId(value: string): EditMessageRequest;

  getUserId(): string;
  setUserId(value: string): EditMessageRequest;

  getBody(): string;
  setBody(value: string): EditMessageRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EditMessageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: EditMessageRequest): EditMessageRequest.AsObject;
  static serializeBinaryToWriter(message: EditMessageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EditMessageRequest;
  static deserializeBinaryFromReader(message: EditMessageRequest, reader: jspb.BinaryReader): EditMessageRequest;
}

export namespace EditMessageRequest {
  export type AsObject = {
    messageId: string;
    userId: string;
    body: string;
  };
}

export class EditMessageResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): EditMessageResponse;
  hasData(): boolean;
  clearData(): EditMessageResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EditMessageResponse.AsObject;
  static toObject(includeInstance: boolean, msg: EditMessageResponse): EditMessageResponse.AsObject;
  static serializeBinaryToWriter(message: EditMessageResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EditMessageResponse;
  static deserializeBinaryFromReader(message: EditMessageResponse, reader: jspb.BinaryReader): EditMessageResponse;
}

export namespace EditMessageResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class DeleteMessageRequest extends jspb.Message {
  getMessageId(): string;
  setMessageId(value: string): DeleteMessageRequest;

  getUserId(): string;
  setUserId(value: string): DeleteMessageRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteMessageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteMessageRequest): DeleteMessageRequest.AsObject;
  static serializeBinaryToWriter(message: DeleteMessageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteMessageRequest;
  static deserializeBinaryFromReader(message: DeleteMessageRequest, reader: jspb.BinaryReader): DeleteMessageRequest;
}

export namespace DeleteMessageRequest {
  export type AsObject = {
    messageId: string;
    userId: string;
  };
}

export class DeleteMessageResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): DeleteMessageResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteMessageResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteMessageResponse): DeleteMessageResponse.AsObject;
  static serializeBinaryToWriter(message: DeleteMessageResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteMessageResponse;
  static deserializeBinaryFromReader(message: DeleteMessageResponse, reader: jspb.BinaryReader): DeleteMessageResponse;
}

export namespace DeleteMessageResponse {
  export type AsObject = {
    message: string;
  };
}

export class ToggleReactionRequest extends jspb.Message {
  getMessageId(): string;
  setMessageId(value: string): ToggleReactionRequest;

  getUserId(): string;
  setUserId(value: string): ToggleReactionRequest;

  getEmoji(): string;
  setEmoji(value: string): ToggleReactionRequest;

  getUserProfileId(): string;
  setUserProfileId(value: string): ToggleReactionRequest;

  getUserProfileType(): string;
  setUserProfileType(value: string): ToggleReactionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ToggleReactionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ToggleReactionRequest): ToggleReactionRequest.AsObject;
  static serializeBinaryToWriter(message: ToggleReactionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ToggleReactionRequest;
  static deserializeBinaryFromReader(message: ToggleReactionRequest, reader: jspb.BinaryReader): ToggleReactionRequest;
}

export namespace ToggleReactionRequest {
  export type AsObject = {
    messageId: string;
    userId: string;
    emoji: string;
    userProfileId: string;
    userProfileType: string;
  };
}

export class ToggleReactionResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): ToggleReactionResponse;
  hasData(): boolean;
  clearData(): ToggleReactionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ToggleReactionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ToggleReactionResponse): ToggleReactionResponse.AsObject;
  static serializeBinaryToWriter(message: ToggleReactionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ToggleReactionResponse;
  static deserializeBinaryFromReader(message: ToggleReactionResponse, reader: jspb.BinaryReader): ToggleReactionResponse;
}

export namespace ToggleReactionResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class ListReactionsRequest extends jspb.Message {
  getMessageId(): string;
  setMessageId(value: string): ListReactionsRequest;

  getOffset(): number;
  setOffset(value: number): ListReactionsRequest;

  getLimit(): number;
  setLimit(value: number): ListReactionsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListReactionsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListReactionsRequest): ListReactionsRequest.AsObject;
  static serializeBinaryToWriter(message: ListReactionsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListReactionsRequest;
  static deserializeBinaryFromReader(message: ListReactionsRequest, reader: jspb.BinaryReader): ListReactionsRequest;
}

export namespace ListReactionsRequest {
  export type AsObject = {
    messageId: string;
    offset: number;
    limit: number;
  };
}

export class ListReactionsResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): ListReactionsResponse;
  hasData(): boolean;
  clearData(): ListReactionsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListReactionsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListReactionsResponse): ListReactionsResponse.AsObject;
  static serializeBinaryToWriter(message: ListReactionsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListReactionsResponse;
  static deserializeBinaryFromReader(message: ListReactionsResponse, reader: jspb.BinaryReader): ListReactionsResponse;
}

export namespace ListReactionsResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class SendEmailRequest extends jspb.Message {
  getTo(): string;
  setTo(value: string): SendEmailRequest;

  getSubject(): string;
  setSubject(value: string): SendEmailRequest;

  getBody(): string;
  setBody(value: string): SendEmailRequest;

  getIsHtml(): boolean;
  setIsHtml(value: boolean): SendEmailRequest;

  getTemplateName(): string;
  setTemplateName(value: string): SendEmailRequest;

  getVariables(): google_protobuf_struct_pb.Struct | undefined;
  setVariables(value?: google_protobuf_struct_pb.Struct): SendEmailRequest;
  hasVariables(): boolean;
  clearVariables(): SendEmailRequest;

  getAttachmentData(): Uint8Array | string;
  getAttachmentData_asU8(): Uint8Array;
  getAttachmentData_asB64(): string;
  setAttachmentData(value: Uint8Array | string): SendEmailRequest;

  getAttachmentName(): string;
  setAttachmentName(value: string): SendEmailRequest;

  getAttachmentType(): string;
  setAttachmentType(value: string): SendEmailRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendEmailRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendEmailRequest): SendEmailRequest.AsObject;
  static serializeBinaryToWriter(message: SendEmailRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendEmailRequest;
  static deserializeBinaryFromReader(message: SendEmailRequest, reader: jspb.BinaryReader): SendEmailRequest;
}

export namespace SendEmailRequest {
  export type AsObject = {
    to: string;
    subject: string;
    body: string;
    isHtml: boolean;
    templateName: string;
    variables?: google_protobuf_struct_pb.Struct.AsObject;
    attachmentData: Uint8Array | string;
    attachmentName: string;
    attachmentType: string;
  };
}

export class SendEmailResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): SendEmailResponse;

  getTo(): string;
  setTo(value: string): SendEmailResponse;

  getSubject(): string;
  setSubject(value: string): SendEmailResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendEmailResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SendEmailResponse): SendEmailResponse.AsObject;
  static serializeBinaryToWriter(message: SendEmailResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendEmailResponse;
  static deserializeBinaryFromReader(message: SendEmailResponse, reader: jspb.BinaryReader): SendEmailResponse;
}

export namespace SendEmailResponse {
  export type AsObject = {
    message: string;
    to: string;
    subject: string;
  };
}

export class PurgeUserDataRequest extends jspb.Message {
  getUserIdsList(): Array<string>;
  setUserIdsList(value: Array<string>): PurgeUserDataRequest;
  clearUserIdsList(): PurgeUserDataRequest;
  addUserIds(value: string, index?: number): PurgeUserDataRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PurgeUserDataRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PurgeUserDataRequest): PurgeUserDataRequest.AsObject;
  static serializeBinaryToWriter(message: PurgeUserDataRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PurgeUserDataRequest;
  static deserializeBinaryFromReader(message: PurgeUserDataRequest, reader: jspb.BinaryReader): PurgeUserDataRequest;
}

export namespace PurgeUserDataRequest {
  export type AsObject = {
    userIdsList: Array<string>;
  };
}

export class PurgeUserDataResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): PurgeUserDataResponse;

  getUsersPurged(): number;
  setUsersPurged(value: number): PurgeUserDataResponse;

  getErrorsList(): Array<string>;
  setErrorsList(value: Array<string>): PurgeUserDataResponse;
  clearErrorsList(): PurgeUserDataResponse;
  addErrors(value: string, index?: number): PurgeUserDataResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PurgeUserDataResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PurgeUserDataResponse): PurgeUserDataResponse.AsObject;
  static serializeBinaryToWriter(message: PurgeUserDataResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PurgeUserDataResponse;
  static deserializeBinaryFromReader(message: PurgeUserDataResponse, reader: jspb.BinaryReader): PurgeUserDataResponse;
}

export namespace PurgeUserDataResponse {
  export type AsObject = {
    message: string;
    usersPurged: number;
    errorsList: Array<string>;
  };
}

