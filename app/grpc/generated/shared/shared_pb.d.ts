import * as jspb from 'google-protobuf'

import * as google_protobuf_struct_pb from 'google-protobuf/google/protobuf/struct_pb'; // proto import: "google/protobuf/struct.proto"


export class GenericResponse extends jspb.Message {
  getHeader(): GenericHeader | undefined;
  setHeader(value?: GenericHeader): GenericResponse;
  hasHeader(): boolean;
  clearHeader(): GenericResponse;

  getBody(): google_protobuf_struct_pb.Struct | undefined;
  setBody(value?: google_protobuf_struct_pb.Struct): GenericResponse;
  hasBody(): boolean;
  clearBody(): GenericResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GenericResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GenericResponse): GenericResponse.AsObject;
  static serializeBinaryToWriter(message: GenericResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GenericResponse;
  static deserializeBinaryFromReader(message: GenericResponse, reader: jspb.BinaryReader): GenericResponse;
}

export namespace GenericResponse {
  export type AsObject = {
    header?: GenericHeader.AsObject;
    body?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class GenericHeader extends jspb.Message {
  getRequestId(): string;
  setRequestId(value: string): GenericHeader;

  getResCode(): number;
  setResCode(value: number): GenericHeader;

  getResMessage(): string;
  setResMessage(value: string): GenericHeader;

  getDisplayMessage(): string;
  setDisplayMessage(value: string): GenericHeader;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GenericHeader.AsObject;
  static toObject(includeInstance: boolean, msg: GenericHeader): GenericHeader.AsObject;
  static serializeBinaryToWriter(message: GenericHeader, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GenericHeader;
  static deserializeBinaryFromReader(message: GenericHeader, reader: jspb.BinaryReader): GenericHeader;
}

export namespace GenericHeader {
  export type AsObject = {
    requestId: string;
    resCode: number;
    resMessage: string;
    displayMessage: string;
  };
}

