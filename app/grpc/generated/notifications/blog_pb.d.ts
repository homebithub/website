import * as jspb from 'google-protobuf'

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb'; // proto import: "google/protobuf/timestamp.proto"
import * as google_protobuf_struct_pb from 'google-protobuf/google/protobuf/struct_pb'; // proto import: "google/protobuf/struct.proto"
import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"


export class BlogPost extends jspb.Message {
  getId(): string;
  setId(value: string): BlogPost;

  getTitle(): string;
  setTitle(value: string): BlogPost;

  getSlug(): string;
  setSlug(value: string): BlogPost;

  getExcerpt(): string;
  setExcerpt(value: string): BlogPost;

  getContent(): string;
  setContent(value: string): BlogPost;

  getFeaturedImage(): string;
  setFeaturedImage(value: string): BlogPost;

  getAuthorId(): string;
  setAuthorId(value: string): BlogPost;

  getAuthorType(): string;
  setAuthorType(value: string): BlogPost;

  getAuthorName(): string;
  setAuthorName(value: string): BlogPost;

  getCategory(): string;
  setCategory(value: string): BlogPost;

  getTagsList(): Array<string>;
  setTagsList(value: Array<string>): BlogPost;
  clearTagsList(): BlogPost;
  addTags(value: string, index?: number): BlogPost;

  getStatus(): string;
  setStatus(value: string): BlogPost;

  getIsFeatured(): boolean;
  setIsFeatured(value: boolean): BlogPost;

  getSeoTitle(): string;
  setSeoTitle(value: string): BlogPost;

  getSeoDescription(): string;
  setSeoDescription(value: string): BlogPost;

  getSeoKeywordsList(): Array<string>;
  setSeoKeywordsList(value: Array<string>): BlogPost;
  clearSeoKeywordsList(): BlogPost;
  addSeoKeywords(value: string, index?: number): BlogPost;

  getPublishedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setPublishedAt(value?: google_protobuf_timestamp_pb.Timestamp): BlogPost;
  hasPublishedAt(): boolean;
  clearPublishedAt(): BlogPost;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): BlogPost;
  hasCreatedAt(): boolean;
  clearCreatedAt(): BlogPost;

  getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): BlogPost;
  hasUpdatedAt(): boolean;
  clearUpdatedAt(): BlogPost;

  getTotalViews(): number;
  setTotalViews(value: number): BlogPost;

  getUniqueViews(): number;
  setUniqueViews(value: number): BlogPost;

  getTotalShares(): number;
  setTotalShares(value: number): BlogPost;

  getTotalLikes(): number;
  setTotalLikes(value: number): BlogPost;

  getTotalConversions(): number;
  setTotalConversions(value: number): BlogPost;

  getApprovedCommentsCount(): number;
  setApprovedCommentsCount(value: number): BlogPost;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlogPost.AsObject;
  static toObject(includeInstance: boolean, msg: BlogPost): BlogPost.AsObject;
  static serializeBinaryToWriter(message: BlogPost, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlogPost;
  static deserializeBinaryFromReader(message: BlogPost, reader: jspb.BinaryReader): BlogPost;
}

export namespace BlogPost {
  export type AsObject = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    authorId: string;
    authorType: string;
    authorName: string;
    category: string;
    tagsList: Array<string>;
    status: string;
    isFeatured: boolean;
    seoTitle: string;
    seoDescription: string;
    seoKeywordsList: Array<string>;
    publishedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    totalViews: number;
    uniqueViews: number;
    totalShares: number;
    totalLikes: number;
    totalConversions: number;
    approvedCommentsCount: number;
  };
}

export class CreatePostRequest extends jspb.Message {
  getTitle(): string;
  setTitle(value: string): CreatePostRequest;

  getSlug(): string;
  setSlug(value: string): CreatePostRequest;

  getExcerpt(): string;
  setExcerpt(value: string): CreatePostRequest;

  getContent(): string;
  setContent(value: string): CreatePostRequest;

  getFeaturedImage(): string;
  setFeaturedImage(value: string): CreatePostRequest;

  getAuthorId(): string;
  setAuthorId(value: string): CreatePostRequest;

  getAuthorType(): string;
  setAuthorType(value: string): CreatePostRequest;

  getAuthorName(): string;
  setAuthorName(value: string): CreatePostRequest;

  getCategory(): string;
  setCategory(value: string): CreatePostRequest;

  getTagsList(): Array<string>;
  setTagsList(value: Array<string>): CreatePostRequest;
  clearTagsList(): CreatePostRequest;
  addTags(value: string, index?: number): CreatePostRequest;

  getIsFeatured(): boolean;
  setIsFeatured(value: boolean): CreatePostRequest;

  getSeoTitle(): string;
  setSeoTitle(value: string): CreatePostRequest;

  getSeoDescription(): string;
  setSeoDescription(value: string): CreatePostRequest;

  getSeoKeywordsList(): Array<string>;
  setSeoKeywordsList(value: Array<string>): CreatePostRequest;
  clearSeoKeywordsList(): CreatePostRequest;
  addSeoKeywords(value: string, index?: number): CreatePostRequest;

  getPublishImmediately(): boolean;
  setPublishImmediately(value: boolean): CreatePostRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreatePostRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreatePostRequest): CreatePostRequest.AsObject;
  static serializeBinaryToWriter(message: CreatePostRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreatePostRequest;
  static deserializeBinaryFromReader(message: CreatePostRequest, reader: jspb.BinaryReader): CreatePostRequest;
}

export namespace CreatePostRequest {
  export type AsObject = {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    authorId: string;
    authorType: string;
    authorName: string;
    category: string;
    tagsList: Array<string>;
    isFeatured: boolean;
    seoTitle: string;
    seoDescription: string;
    seoKeywordsList: Array<string>;
    publishImmediately: boolean;
  };
}

export class UpdatePostRequest extends jspb.Message {
  getId(): string;
  setId(value: string): UpdatePostRequest;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdatePostRequest;
  hasData(): boolean;
  clearData(): UpdatePostRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdatePostRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdatePostRequest): UpdatePostRequest.AsObject;
  static serializeBinaryToWriter(message: UpdatePostRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdatePostRequest;
  static deserializeBinaryFromReader(message: UpdatePostRequest, reader: jspb.BinaryReader): UpdatePostRequest;
}

export namespace UpdatePostRequest {
  export type AsObject = {
    id: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class GetPostRequest extends jspb.Message {
  getId(): string;
  setId(value: string): GetPostRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPostRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPostRequest): GetPostRequest.AsObject;
  static serializeBinaryToWriter(message: GetPostRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPostRequest;
  static deserializeBinaryFromReader(message: GetPostRequest, reader: jspb.BinaryReader): GetPostRequest;
}

export namespace GetPostRequest {
  export type AsObject = {
    id: string;
  };
}

export class GetPostBySlugRequest extends jspb.Message {
  getSlug(): string;
  setSlug(value: string): GetPostBySlugRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPostBySlugRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPostBySlugRequest): GetPostBySlugRequest.AsObject;
  static serializeBinaryToWriter(message: GetPostBySlugRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPostBySlugRequest;
  static deserializeBinaryFromReader(message: GetPostBySlugRequest, reader: jspb.BinaryReader): GetPostBySlugRequest;
}

export namespace GetPostBySlugRequest {
  export type AsObject = {
    slug: string;
  };
}

export class ListPostsRequest extends jspb.Message {
  getLimit(): number;
  setLimit(value: number): ListPostsRequest;

  getOffset(): number;
  setOffset(value: number): ListPostsRequest;

  getStatus(): string;
  setStatus(value: string): ListPostsRequest;

  getCategory(): string;
  setCategory(value: string): ListPostsRequest;

  getTagsList(): Array<string>;
  setTagsList(value: Array<string>): ListPostsRequest;
  clearTagsList(): ListPostsRequest;
  addTags(value: string, index?: number): ListPostsRequest;

  getSearch(): string;
  setSearch(value: string): ListPostsRequest;

  getSortBy(): string;
  setSortBy(value: string): ListPostsRequest;

  getSortOrder(): string;
  setSortOrder(value: string): ListPostsRequest;

  getFeaturedOnly(): boolean;
  setFeaturedOnly(value: boolean): ListPostsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListPostsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListPostsRequest): ListPostsRequest.AsObject;
  static serializeBinaryToWriter(message: ListPostsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListPostsRequest;
  static deserializeBinaryFromReader(message: ListPostsRequest, reader: jspb.BinaryReader): ListPostsRequest;
}

export namespace ListPostsRequest {
  export type AsObject = {
    limit: number;
    offset: number;
    status: string;
    category: string;
    tagsList: Array<string>;
    search: string;
    sortBy: string;
    sortOrder: string;
    featuredOnly: boolean;
  };
}

export class ListPostsResponse extends jspb.Message {
  getPostsList(): Array<BlogPost>;
  setPostsList(value: Array<BlogPost>): ListPostsResponse;
  clearPostsList(): ListPostsResponse;
  addPosts(value?: BlogPost, index?: number): BlogPost;

  getTotal(): number;
  setTotal(value: number): ListPostsResponse;

  getLimit(): number;
  setLimit(value: number): ListPostsResponse;

  getOffset(): number;
  setOffset(value: number): ListPostsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListPostsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListPostsResponse): ListPostsResponse.AsObject;
  static serializeBinaryToWriter(message: ListPostsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListPostsResponse;
  static deserializeBinaryFromReader(message: ListPostsResponse, reader: jspb.BinaryReader): ListPostsResponse;
}

export namespace ListPostsResponse {
  export type AsObject = {
    postsList: Array<BlogPost.AsObject>;
    total: number;
    limit: number;
    offset: number;
  };
}

export class DeletePostRequest extends jspb.Message {
  getId(): string;
  setId(value: string): DeletePostRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeletePostRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DeletePostRequest): DeletePostRequest.AsObject;
  static serializeBinaryToWriter(message: DeletePostRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeletePostRequest;
  static deserializeBinaryFromReader(message: DeletePostRequest, reader: jspb.BinaryReader): DeletePostRequest;
}

export namespace DeletePostRequest {
  export type AsObject = {
    id: string;
  };
}

export class PublishPostRequest extends jspb.Message {
  getId(): string;
  setId(value: string): PublishPostRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PublishPostRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PublishPostRequest): PublishPostRequest.AsObject;
  static serializeBinaryToWriter(message: PublishPostRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PublishPostRequest;
  static deserializeBinaryFromReader(message: PublishPostRequest, reader: jspb.BinaryReader): PublishPostRequest;
}

export namespace PublishPostRequest {
  export type AsObject = {
    id: string;
  };
}

export class UnpublishPostRequest extends jspb.Message {
  getId(): string;
  setId(value: string): UnpublishPostRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UnpublishPostRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UnpublishPostRequest): UnpublishPostRequest.AsObject;
  static serializeBinaryToWriter(message: UnpublishPostRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UnpublishPostRequest;
  static deserializeBinaryFromReader(message: UnpublishPostRequest, reader: jspb.BinaryReader): UnpublishPostRequest;
}

export namespace UnpublishPostRequest {
  export type AsObject = {
    id: string;
  };
}

export class BlogPostResponse extends jspb.Message {
  getPost(): BlogPost | undefined;
  setPost(value?: BlogPost): BlogPostResponse;
  hasPost(): boolean;
  clearPost(): BlogPostResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlogPostResponse.AsObject;
  static toObject(includeInstance: boolean, msg: BlogPostResponse): BlogPostResponse.AsObject;
  static serializeBinaryToWriter(message: BlogPostResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlogPostResponse;
  static deserializeBinaryFromReader(message: BlogPostResponse, reader: jspb.BinaryReader): BlogPostResponse;
}

export namespace BlogPostResponse {
  export type AsObject = {
    post?: BlogPost.AsObject;
  };
}

export class TrackViewRequest extends jspb.Message {
  getPostId(): string;
  setPostId(value: string): TrackViewRequest;

  getUserId(): string;
  setUserId(value: string): TrackViewRequest;

  getSessionId(): string;
  setSessionId(value: string): TrackViewRequest;

  getSource(): string;
  setSource(value: string): TrackViewRequest;

  getReferrer(): string;
  setReferrer(value: string): TrackViewRequest;

  getUtmSource(): string;
  setUtmSource(value: string): TrackViewRequest;

  getUtmMedium(): string;
  setUtmMedium(value: string): TrackViewRequest;

  getUtmCampaign(): string;
  setUtmCampaign(value: string): TrackViewRequest;

  getDeviceType(): string;
  setDeviceType(value: string): TrackViewRequest;

  getBrowser(): string;
  setBrowser(value: string): TrackViewRequest;

  getOs(): string;
  setOs(value: string): TrackViewRequest;

  getCountry(): string;
  setCountry(value: string): TrackViewRequest;

  getCity(): string;
  setCity(value: string): TrackViewRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TrackViewRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TrackViewRequest): TrackViewRequest.AsObject;
  static serializeBinaryToWriter(message: TrackViewRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TrackViewRequest;
  static deserializeBinaryFromReader(message: TrackViewRequest, reader: jspb.BinaryReader): TrackViewRequest;
}

export namespace TrackViewRequest {
  export type AsObject = {
    postId: string;
    userId: string;
    sessionId: string;
    source: string;
    referrer: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    deviceType: string;
    browser: string;
    os: string;
    country: string;
    city: string;
  };
}

export class TrackShareRequest extends jspb.Message {
  getPostId(): string;
  setPostId(value: string): TrackShareRequest;

  getUserId(): string;
  setUserId(value: string): TrackShareRequest;

  getSessionId(): string;
  setSessionId(value: string): TrackShareRequest;

  getPlatform(): string;
  setPlatform(value: string): TrackShareRequest;

  getMetadata(): google_protobuf_struct_pb.Struct | undefined;
  setMetadata(value?: google_protobuf_struct_pb.Struct): TrackShareRequest;
  hasMetadata(): boolean;
  clearMetadata(): TrackShareRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TrackShareRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TrackShareRequest): TrackShareRequest.AsObject;
  static serializeBinaryToWriter(message: TrackShareRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TrackShareRequest;
  static deserializeBinaryFromReader(message: TrackShareRequest, reader: jspb.BinaryReader): TrackShareRequest;
}

export namespace TrackShareRequest {
  export type AsObject = {
    postId: string;
    userId: string;
    sessionId: string;
    platform: string;
    metadata?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class TrackClickRequest extends jspb.Message {
  getPostId(): string;
  setPostId(value: string): TrackClickRequest;

  getUserId(): string;
  setUserId(value: string): TrackClickRequest;

  getSessionId(): string;
  setSessionId(value: string): TrackClickRequest;

  getClickType(): string;
  setClickType(value: string): TrackClickRequest;

  getTargetUrl(): string;
  setTargetUrl(value: string): TrackClickRequest;

  getMetadata(): google_protobuf_struct_pb.Struct | undefined;
  setMetadata(value?: google_protobuf_struct_pb.Struct): TrackClickRequest;
  hasMetadata(): boolean;
  clearMetadata(): TrackClickRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TrackClickRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TrackClickRequest): TrackClickRequest.AsObject;
  static serializeBinaryToWriter(message: TrackClickRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TrackClickRequest;
  static deserializeBinaryFromReader(message: TrackClickRequest, reader: jspb.BinaryReader): TrackClickRequest;
}

export namespace TrackClickRequest {
  export type AsObject = {
    postId: string;
    userId: string;
    sessionId: string;
    clickType: string;
    targetUrl: string;
    metadata?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class GetPostAnalyticsRequest extends jspb.Message {
  getPostId(): string;
  setPostId(value: string): GetPostAnalyticsRequest;

  getStartDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setStartDate(value?: google_protobuf_timestamp_pb.Timestamp): GetPostAnalyticsRequest;
  hasStartDate(): boolean;
  clearStartDate(): GetPostAnalyticsRequest;

  getEndDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setEndDate(value?: google_protobuf_timestamp_pb.Timestamp): GetPostAnalyticsRequest;
  hasEndDate(): boolean;
  clearEndDate(): GetPostAnalyticsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPostAnalyticsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPostAnalyticsRequest): GetPostAnalyticsRequest.AsObject;
  static serializeBinaryToWriter(message: GetPostAnalyticsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPostAnalyticsRequest;
  static deserializeBinaryFromReader(message: GetPostAnalyticsRequest, reader: jspb.BinaryReader): GetPostAnalyticsRequest;
}

export namespace GetPostAnalyticsRequest {
  export type AsObject = {
    postId: string;
    startDate?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    endDate?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class PostAnalyticsResponse extends jspb.Message {
  getPostId(): string;
  setPostId(value: string): PostAnalyticsResponse;

  getTotalViews(): number;
  setTotalViews(value: number): PostAnalyticsResponse;

  getUniqueViews(): number;
  setUniqueViews(value: number): PostAnalyticsResponse;

  getTotalShares(): number;
  setTotalShares(value: number): PostAnalyticsResponse;

  getTotalClicks(): number;
  setTotalClicks(value: number): PostAnalyticsResponse;

  getTotalConversions(): number;
  setTotalConversions(value: number): PostAnalyticsResponse;

  getConversionRate(): number;
  setConversionRate(value: number): PostAnalyticsResponse;

  getSourceBreakdownList(): Array<AnalyticsBreakdown>;
  setSourceBreakdownList(value: Array<AnalyticsBreakdown>): PostAnalyticsResponse;
  clearSourceBreakdownList(): PostAnalyticsResponse;
  addSourceBreakdown(value?: AnalyticsBreakdown, index?: number): AnalyticsBreakdown;

  getDeviceBreakdownList(): Array<AnalyticsBreakdown>;
  setDeviceBreakdownList(value: Array<AnalyticsBreakdown>): PostAnalyticsResponse;
  clearDeviceBreakdownList(): PostAnalyticsResponse;
  addDeviceBreakdown(value?: AnalyticsBreakdown, index?: number): AnalyticsBreakdown;

  getCountryBreakdownList(): Array<AnalyticsBreakdown>;
  setCountryBreakdownList(value: Array<AnalyticsBreakdown>): PostAnalyticsResponse;
  clearCountryBreakdownList(): PostAnalyticsResponse;
  addCountryBreakdown(value?: AnalyticsBreakdown, index?: number): AnalyticsBreakdown;

  getDailyStatsList(): Array<DailyStats>;
  setDailyStatsList(value: Array<DailyStats>): PostAnalyticsResponse;
  clearDailyStatsList(): PostAnalyticsResponse;
  addDailyStats(value?: DailyStats, index?: number): DailyStats;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PostAnalyticsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PostAnalyticsResponse): PostAnalyticsResponse.AsObject;
  static serializeBinaryToWriter(message: PostAnalyticsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PostAnalyticsResponse;
  static deserializeBinaryFromReader(message: PostAnalyticsResponse, reader: jspb.BinaryReader): PostAnalyticsResponse;
}

export namespace PostAnalyticsResponse {
  export type AsObject = {
    postId: string;
    totalViews: number;
    uniqueViews: number;
    totalShares: number;
    totalClicks: number;
    totalConversions: number;
    conversionRate: number;
    sourceBreakdownList: Array<AnalyticsBreakdown.AsObject>;
    deviceBreakdownList: Array<AnalyticsBreakdown.AsObject>;
    countryBreakdownList: Array<AnalyticsBreakdown.AsObject>;
    dailyStatsList: Array<DailyStats.AsObject>;
  };
}

export class AnalyticsBreakdown extends jspb.Message {
  getLabel(): string;
  setLabel(value: string): AnalyticsBreakdown;

  getCount(): number;
  setCount(value: number): AnalyticsBreakdown;

  getPercentage(): number;
  setPercentage(value: number): AnalyticsBreakdown;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AnalyticsBreakdown.AsObject;
  static toObject(includeInstance: boolean, msg: AnalyticsBreakdown): AnalyticsBreakdown.AsObject;
  static serializeBinaryToWriter(message: AnalyticsBreakdown, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AnalyticsBreakdown;
  static deserializeBinaryFromReader(message: AnalyticsBreakdown, reader: jspb.BinaryReader): AnalyticsBreakdown;
}

export namespace AnalyticsBreakdown {
  export type AsObject = {
    label: string;
    count: number;
    percentage: number;
  };
}

export class DailyStats extends jspb.Message {
  getDate(): string;
  setDate(value: string): DailyStats;

  getViews(): number;
  setViews(value: number): DailyStats;

  getShares(): number;
  setShares(value: number): DailyStats;

  getConversions(): number;
  setConversions(value: number): DailyStats;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DailyStats.AsObject;
  static toObject(includeInstance: boolean, msg: DailyStats): DailyStats.AsObject;
  static serializeBinaryToWriter(message: DailyStats, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DailyStats;
  static deserializeBinaryFromReader(message: DailyStats, reader: jspb.BinaryReader): DailyStats;
}

export namespace DailyStats {
  export type AsObject = {
    date: string;
    views: number;
    shares: number;
    conversions: number;
  };
}

export class GetAnalyticsSummaryRequest extends jspb.Message {
  getStartDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setStartDate(value?: google_protobuf_timestamp_pb.Timestamp): GetAnalyticsSummaryRequest;
  hasStartDate(): boolean;
  clearStartDate(): GetAnalyticsSummaryRequest;

  getEndDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setEndDate(value?: google_protobuf_timestamp_pb.Timestamp): GetAnalyticsSummaryRequest;
  hasEndDate(): boolean;
  clearEndDate(): GetAnalyticsSummaryRequest;

  getTopPostsLimit(): number;
  setTopPostsLimit(value: number): GetAnalyticsSummaryRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAnalyticsSummaryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetAnalyticsSummaryRequest): GetAnalyticsSummaryRequest.AsObject;
  static serializeBinaryToWriter(message: GetAnalyticsSummaryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAnalyticsSummaryRequest;
  static deserializeBinaryFromReader(message: GetAnalyticsSummaryRequest, reader: jspb.BinaryReader): GetAnalyticsSummaryRequest;
}

export namespace GetAnalyticsSummaryRequest {
  export type AsObject = {
    startDate?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    endDate?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    topPostsLimit: number;
  };
}

export class AnalyticsSummaryResponse extends jspb.Message {
  getTotalPosts(): number;
  setTotalPosts(value: number): AnalyticsSummaryResponse;

  getPublishedPosts(): number;
  setPublishedPosts(value: number): AnalyticsSummaryResponse;

  getTotalViews(): number;
  setTotalViews(value: number): AnalyticsSummaryResponse;

  getTotalConversions(): number;
  setTotalConversions(value: number): AnalyticsSummaryResponse;

  getOverallConversionRate(): number;
  setOverallConversionRate(value: number): AnalyticsSummaryResponse;

  getTopPostsByViewsList(): Array<BlogPost>;
  setTopPostsByViewsList(value: Array<BlogPost>): AnalyticsSummaryResponse;
  clearTopPostsByViewsList(): AnalyticsSummaryResponse;
  addTopPostsByViews(value?: BlogPost, index?: number): BlogPost;

  getTopPostsByConversionsList(): Array<BlogPost>;
  setTopPostsByConversionsList(value: Array<BlogPost>): AnalyticsSummaryResponse;
  clearTopPostsByConversionsList(): AnalyticsSummaryResponse;
  addTopPostsByConversions(value?: BlogPost, index?: number): BlogPost;

  getCategoryStatsList(): Array<CategoryStats>;
  setCategoryStatsList(value: Array<CategoryStats>): AnalyticsSummaryResponse;
  clearCategoryStatsList(): AnalyticsSummaryResponse;
  addCategoryStats(value?: CategoryStats, index?: number): CategoryStats;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AnalyticsSummaryResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AnalyticsSummaryResponse): AnalyticsSummaryResponse.AsObject;
  static serializeBinaryToWriter(message: AnalyticsSummaryResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AnalyticsSummaryResponse;
  static deserializeBinaryFromReader(message: AnalyticsSummaryResponse, reader: jspb.BinaryReader): AnalyticsSummaryResponse;
}

export namespace AnalyticsSummaryResponse {
  export type AsObject = {
    totalPosts: number;
    publishedPosts: number;
    totalViews: number;
    totalConversions: number;
    overallConversionRate: number;
    topPostsByViewsList: Array<BlogPost.AsObject>;
    topPostsByConversionsList: Array<BlogPost.AsObject>;
    categoryStatsList: Array<CategoryStats.AsObject>;
  };
}

export class CategoryStats extends jspb.Message {
  getCategory(): string;
  setCategory(value: string): CategoryStats;

  getPostCount(): number;
  setPostCount(value: number): CategoryStats;

  getTotalViews(): number;
  setTotalViews(value: number): CategoryStats;

  getTotalConversions(): number;
  setTotalConversions(value: number): CategoryStats;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CategoryStats.AsObject;
  static toObject(includeInstance: boolean, msg: CategoryStats): CategoryStats.AsObject;
  static serializeBinaryToWriter(message: CategoryStats, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CategoryStats;
  static deserializeBinaryFromReader(message: CategoryStats, reader: jspb.BinaryReader): CategoryStats;
}

export namespace CategoryStats {
  export type AsObject = {
    category: string;
    postCount: number;
    totalViews: number;
    totalConversions: number;
  };
}

export class TrackConversionRequest extends jspb.Message {
  getPostId(): string;
  setPostId(value: string): TrackConversionRequest;

  getUserId(): string;
  setUserId(value: string): TrackConversionRequest;

  getSessionId(): string;
  setSessionId(value: string): TrackConversionRequest;

  getConversionType(): string;
  setConversionType(value: string): TrackConversionRequest;

  getConversionValue(): number;
  setConversionValue(value: number): TrackConversionRequest;

  getSource(): string;
  setSource(value: string): TrackConversionRequest;

  getUtmSource(): string;
  setUtmSource(value: string): TrackConversionRequest;

  getUtmMedium(): string;
  setUtmMedium(value: string): TrackConversionRequest;

  getUtmCampaign(): string;
  setUtmCampaign(value: string): TrackConversionRequest;

  getTimeToConvertSeconds(): number;
  setTimeToConvertSeconds(value: number): TrackConversionRequest;

  getMetadata(): google_protobuf_struct_pb.Struct | undefined;
  setMetadata(value?: google_protobuf_struct_pb.Struct): TrackConversionRequest;
  hasMetadata(): boolean;
  clearMetadata(): TrackConversionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TrackConversionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TrackConversionRequest): TrackConversionRequest.AsObject;
  static serializeBinaryToWriter(message: TrackConversionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TrackConversionRequest;
  static deserializeBinaryFromReader(message: TrackConversionRequest, reader: jspb.BinaryReader): TrackConversionRequest;
}

export namespace TrackConversionRequest {
  export type AsObject = {
    postId: string;
    userId: string;
    sessionId: string;
    conversionType: string;
    conversionValue: number;
    source: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    timeToConvertSeconds: number;
    metadata?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class GetPostConversionsRequest extends jspb.Message {
  getPostId(): string;
  setPostId(value: string): GetPostConversionsRequest;

  getStartDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setStartDate(value?: google_protobuf_timestamp_pb.Timestamp): GetPostConversionsRequest;
  hasStartDate(): boolean;
  clearStartDate(): GetPostConversionsRequest;

  getEndDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setEndDate(value?: google_protobuf_timestamp_pb.Timestamp): GetPostConversionsRequest;
  hasEndDate(): boolean;
  clearEndDate(): GetPostConversionsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPostConversionsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPostConversionsRequest): GetPostConversionsRequest.AsObject;
  static serializeBinaryToWriter(message: GetPostConversionsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPostConversionsRequest;
  static deserializeBinaryFromReader(message: GetPostConversionsRequest, reader: jspb.BinaryReader): GetPostConversionsRequest;
}

export namespace GetPostConversionsRequest {
  export type AsObject = {
    postId: string;
    startDate?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    endDate?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class PostConversionsResponse extends jspb.Message {
  getPostId(): string;
  setPostId(value: string): PostConversionsResponse;

  getTotalConversions(): number;
  setTotalConversions(value: number): PostConversionsResponse;

  getTotalConversionValue(): number;
  setTotalConversionValue(value: number): PostConversionsResponse;

  getTypeBreakdownList(): Array<ConversionBreakdown>;
  setTypeBreakdownList(value: Array<ConversionBreakdown>): PostConversionsResponse;
  clearTypeBreakdownList(): PostConversionsResponse;
  addTypeBreakdown(value?: ConversionBreakdown, index?: number): ConversionBreakdown;

  getDailyConversionsList(): Array<DailyConversions>;
  setDailyConversionsList(value: Array<DailyConversions>): PostConversionsResponse;
  clearDailyConversionsList(): PostConversionsResponse;
  addDailyConversions(value?: DailyConversions, index?: number): DailyConversions;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PostConversionsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PostConversionsResponse): PostConversionsResponse.AsObject;
  static serializeBinaryToWriter(message: PostConversionsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PostConversionsResponse;
  static deserializeBinaryFromReader(message: PostConversionsResponse, reader: jspb.BinaryReader): PostConversionsResponse;
}

export namespace PostConversionsResponse {
  export type AsObject = {
    postId: string;
    totalConversions: number;
    totalConversionValue: number;
    typeBreakdownList: Array<ConversionBreakdown.AsObject>;
    dailyConversionsList: Array<DailyConversions.AsObject>;
  };
}

export class ConversionBreakdown extends jspb.Message {
  getConversionType(): string;
  setConversionType(value: string): ConversionBreakdown;

  getCount(): number;
  setCount(value: number): ConversionBreakdown;

  getTotalValue(): number;
  setTotalValue(value: number): ConversionBreakdown;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConversionBreakdown.AsObject;
  static toObject(includeInstance: boolean, msg: ConversionBreakdown): ConversionBreakdown.AsObject;
  static serializeBinaryToWriter(message: ConversionBreakdown, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConversionBreakdown;
  static deserializeBinaryFromReader(message: ConversionBreakdown, reader: jspb.BinaryReader): ConversionBreakdown;
}

export namespace ConversionBreakdown {
  export type AsObject = {
    conversionType: string;
    count: number;
    totalValue: number;
  };
}

export class DailyConversions extends jspb.Message {
  getDate(): string;
  setDate(value: string): DailyConversions;

  getConversions(): number;
  setConversions(value: number): DailyConversions;

  getConversionValue(): number;
  setConversionValue(value: number): DailyConversions;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DailyConversions.AsObject;
  static toObject(includeInstance: boolean, msg: DailyConversions): DailyConversions.AsObject;
  static serializeBinaryToWriter(message: DailyConversions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DailyConversions;
  static deserializeBinaryFromReader(message: DailyConversions, reader: jspb.BinaryReader): DailyConversions;
}

export namespace DailyConversions {
  export type AsObject = {
    date: string;
    conversions: number;
    conversionValue: number;
  };
}

export class Comment extends jspb.Message {
  getId(): string;
  setId(value: string): Comment;

  getPostId(): string;
  setPostId(value: string): Comment;

  getUserId(): string;
  setUserId(value: string): Comment;

  getUserName(): string;
  setUserName(value: string): Comment;

  getUserEmail(): string;
  setUserEmail(value: string): Comment;

  getUserAvatar(): string;
  setUserAvatar(value: string): Comment;

  getContent(): string;
  setContent(value: string): Comment;

  getParentCommentId(): string;
  setParentCommentId(value: string): Comment;

  getStatus(): string;
  setStatus(value: string): Comment;

  getLikesCount(): number;
  setLikesCount(value: number): Comment;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): Comment;
  hasCreatedAt(): boolean;
  clearCreatedAt(): Comment;

  getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): Comment;
  hasUpdatedAt(): boolean;
  clearUpdatedAt(): Comment;

  getRepliesList(): Array<Comment>;
  setRepliesList(value: Array<Comment>): Comment;
  clearRepliesList(): Comment;
  addReplies(value?: Comment, index?: number): Comment;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Comment.AsObject;
  static toObject(includeInstance: boolean, msg: Comment): Comment.AsObject;
  static serializeBinaryToWriter(message: Comment, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Comment;
  static deserializeBinaryFromReader(message: Comment, reader: jspb.BinaryReader): Comment;
}

export namespace Comment {
  export type AsObject = {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar: string;
    content: string;
    parentCommentId: string;
    status: string;
    likesCount: number;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    repliesList: Array<Comment.AsObject>;
  };
}

export class CreateCommentRequest extends jspb.Message {
  getPostId(): string;
  setPostId(value: string): CreateCommentRequest;

  getUserId(): string;
  setUserId(value: string): CreateCommentRequest;

  getUserName(): string;
  setUserName(value: string): CreateCommentRequest;

  getUserEmail(): string;
  setUserEmail(value: string): CreateCommentRequest;

  getUserAvatar(): string;
  setUserAvatar(value: string): CreateCommentRequest;

  getContent(): string;
  setContent(value: string): CreateCommentRequest;

  getParentCommentId(): string;
  setParentCommentId(value: string): CreateCommentRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateCommentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateCommentRequest): CreateCommentRequest.AsObject;
  static serializeBinaryToWriter(message: CreateCommentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateCommentRequest;
  static deserializeBinaryFromReader(message: CreateCommentRequest, reader: jspb.BinaryReader): CreateCommentRequest;
}

export namespace CreateCommentRequest {
  export type AsObject = {
    postId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar: string;
    content: string;
    parentCommentId: string;
  };
}

export class ListCommentsRequest extends jspb.Message {
  getPostId(): string;
  setPostId(value: string): ListCommentsRequest;

  getStatus(): string;
  setStatus(value: string): ListCommentsRequest;

  getLimit(): number;
  setLimit(value: number): ListCommentsRequest;

  getOffset(): number;
  setOffset(value: number): ListCommentsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListCommentsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListCommentsRequest): ListCommentsRequest.AsObject;
  static serializeBinaryToWriter(message: ListCommentsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListCommentsRequest;
  static deserializeBinaryFromReader(message: ListCommentsRequest, reader: jspb.BinaryReader): ListCommentsRequest;
}

export namespace ListCommentsRequest {
  export type AsObject = {
    postId: string;
    status: string;
    limit: number;
    offset: number;
  };
}

export class ListCommentsResponse extends jspb.Message {
  getCommentsList(): Array<Comment>;
  setCommentsList(value: Array<Comment>): ListCommentsResponse;
  clearCommentsList(): ListCommentsResponse;
  addComments(value?: Comment, index?: number): Comment;

  getTotal(): number;
  setTotal(value: number): ListCommentsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListCommentsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListCommentsResponse): ListCommentsResponse.AsObject;
  static serializeBinaryToWriter(message: ListCommentsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListCommentsResponse;
  static deserializeBinaryFromReader(message: ListCommentsResponse, reader: jspb.BinaryReader): ListCommentsResponse;
}

export namespace ListCommentsResponse {
  export type AsObject = {
    commentsList: Array<Comment.AsObject>;
    total: number;
  };
}

export class ModerateCommentRequest extends jspb.Message {
  getId(): string;
  setId(value: string): ModerateCommentRequest;

  getStatus(): string;
  setStatus(value: string): ModerateCommentRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ModerateCommentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ModerateCommentRequest): ModerateCommentRequest.AsObject;
  static serializeBinaryToWriter(message: ModerateCommentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ModerateCommentRequest;
  static deserializeBinaryFromReader(message: ModerateCommentRequest, reader: jspb.BinaryReader): ModerateCommentRequest;
}

export namespace ModerateCommentRequest {
  export type AsObject = {
    id: string;
    status: string;
  };
}

export class CommentResponse extends jspb.Message {
  getComment(): Comment | undefined;
  setComment(value?: Comment): CommentResponse;
  hasComment(): boolean;
  clearComment(): CommentResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommentResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CommentResponse): CommentResponse.AsObject;
  static serializeBinaryToWriter(message: CommentResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommentResponse;
  static deserializeBinaryFromReader(message: CommentResponse, reader: jspb.BinaryReader): CommentResponse;
}

export namespace CommentResponse {
  export type AsObject = {
    comment?: Comment.AsObject;
  };
}

export class Category extends jspb.Message {
  getId(): string;
  setId(value: string): Category;

  getName(): string;
  setName(value: string): Category;

  getSlug(): string;
  setSlug(value: string): Category;

  getDescription(): string;
  setDescription(value: string): Category;

  getParentCategoryId(): string;
  setParentCategoryId(value: string): Category;

  getDisplayOrder(): number;
  setDisplayOrder(value: number): Category;

  getIsActive(): boolean;
  setIsActive(value: boolean): Category;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): Category;
  hasCreatedAt(): boolean;
  clearCreatedAt(): Category;

  getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): Category;
  hasUpdatedAt(): boolean;
  clearUpdatedAt(): Category;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Category.AsObject;
  static toObject(includeInstance: boolean, msg: Category): Category.AsObject;
  static serializeBinaryToWriter(message: Category, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Category;
  static deserializeBinaryFromReader(message: Category, reader: jspb.BinaryReader): Category;
}

export namespace Category {
  export type AsObject = {
    id: string;
    name: string;
    slug: string;
    description: string;
    parentCategoryId: string;
    displayOrder: number;
    isActive: boolean;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class CreateCategoryRequest extends jspb.Message {
  getName(): string;
  setName(value: string): CreateCategoryRequest;

  getSlug(): string;
  setSlug(value: string): CreateCategoryRequest;

  getDescription(): string;
  setDescription(value: string): CreateCategoryRequest;

  getParentCategoryId(): string;
  setParentCategoryId(value: string): CreateCategoryRequest;

  getDisplayOrder(): number;
  setDisplayOrder(value: number): CreateCategoryRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateCategoryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateCategoryRequest): CreateCategoryRequest.AsObject;
  static serializeBinaryToWriter(message: CreateCategoryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateCategoryRequest;
  static deserializeBinaryFromReader(message: CreateCategoryRequest, reader: jspb.BinaryReader): CreateCategoryRequest;
}

export namespace CreateCategoryRequest {
  export type AsObject = {
    name: string;
    slug: string;
    description: string;
    parentCategoryId: string;
    displayOrder: number;
  };
}

export class ListCategoriesRequest extends jspb.Message {
  getActiveOnly(): boolean;
  setActiveOnly(value: boolean): ListCategoriesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListCategoriesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListCategoriesRequest): ListCategoriesRequest.AsObject;
  static serializeBinaryToWriter(message: ListCategoriesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListCategoriesRequest;
  static deserializeBinaryFromReader(message: ListCategoriesRequest, reader: jspb.BinaryReader): ListCategoriesRequest;
}

export namespace ListCategoriesRequest {
  export type AsObject = {
    activeOnly: boolean;
  };
}

export class ListCategoriesResponse extends jspb.Message {
  getCategoriesList(): Array<Category>;
  setCategoriesList(value: Array<Category>): ListCategoriesResponse;
  clearCategoriesList(): ListCategoriesResponse;
  addCategories(value?: Category, index?: number): Category;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListCategoriesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListCategoriesResponse): ListCategoriesResponse.AsObject;
  static serializeBinaryToWriter(message: ListCategoriesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListCategoriesResponse;
  static deserializeBinaryFromReader(message: ListCategoriesResponse, reader: jspb.BinaryReader): ListCategoriesResponse;
}

export namespace ListCategoriesResponse {
  export type AsObject = {
    categoriesList: Array<Category.AsObject>;
  };
}

export class CategoryResponse extends jspb.Message {
  getCategory(): Category | undefined;
  setCategory(value?: Category): CategoryResponse;
  hasCategory(): boolean;
  clearCategory(): CategoryResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CategoryResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CategoryResponse): CategoryResponse.AsObject;
  static serializeBinaryToWriter(message: CategoryResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CategoryResponse;
  static deserializeBinaryFromReader(message: CategoryResponse, reader: jspb.BinaryReader): CategoryResponse;
}

export namespace CategoryResponse {
  export type AsObject = {
    category?: Category.AsObject;
  };
}

export class LikePostRequest extends jspb.Message {
  getPostId(): string;
  setPostId(value: string): LikePostRequest;

  getUserId(): string;
  setUserId(value: string): LikePostRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LikePostRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LikePostRequest): LikePostRequest.AsObject;
  static serializeBinaryToWriter(message: LikePostRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LikePostRequest;
  static deserializeBinaryFromReader(message: LikePostRequest, reader: jspb.BinaryReader): LikePostRequest;
}

export namespace LikePostRequest {
  export type AsObject = {
    postId: string;
    userId: string;
  };
}

export class LikePostResponse extends jspb.Message {
  getTotalLikes(): number;
  setTotalLikes(value: number): LikePostResponse;

  getLiked(): boolean;
  setLiked(value: boolean): LikePostResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LikePostResponse.AsObject;
  static toObject(includeInstance: boolean, msg: LikePostResponse): LikePostResponse.AsObject;
  static serializeBinaryToWriter(message: LikePostResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LikePostResponse;
  static deserializeBinaryFromReader(message: LikePostResponse, reader: jspb.BinaryReader): LikePostResponse;
}

export namespace LikePostResponse {
  export type AsObject = {
    totalLikes: number;
    liked: boolean;
  };
}

export class UnlikePostRequest extends jspb.Message {
  getPostId(): string;
  setPostId(value: string): UnlikePostRequest;

  getUserId(): string;
  setUserId(value: string): UnlikePostRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UnlikePostRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UnlikePostRequest): UnlikePostRequest.AsObject;
  static serializeBinaryToWriter(message: UnlikePostRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UnlikePostRequest;
  static deserializeBinaryFromReader(message: UnlikePostRequest, reader: jspb.BinaryReader): UnlikePostRequest;
}

export namespace UnlikePostRequest {
  export type AsObject = {
    postId: string;
    userId: string;
  };
}

export class GetLikeStatusRequest extends jspb.Message {
  getPostId(): string;
  setPostId(value: string): GetLikeStatusRequest;

  getUserId(): string;
  setUserId(value: string): GetLikeStatusRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetLikeStatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetLikeStatusRequest): GetLikeStatusRequest.AsObject;
  static serializeBinaryToWriter(message: GetLikeStatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetLikeStatusRequest;
  static deserializeBinaryFromReader(message: GetLikeStatusRequest, reader: jspb.BinaryReader): GetLikeStatusRequest;
}

export namespace GetLikeStatusRequest {
  export type AsObject = {
    postId: string;
    userId: string;
  };
}

export class LikeStatusResponse extends jspb.Message {
  getTotalLikes(): number;
  setTotalLikes(value: number): LikeStatusResponse;

  getLiked(): boolean;
  setLiked(value: boolean): LikeStatusResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LikeStatusResponse.AsObject;
  static toObject(includeInstance: boolean, msg: LikeStatusResponse): LikeStatusResponse.AsObject;
  static serializeBinaryToWriter(message: LikeStatusResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LikeStatusResponse;
  static deserializeBinaryFromReader(message: LikeStatusResponse, reader: jspb.BinaryReader): LikeStatusResponse;
}

export namespace LikeStatusResponse {
  export type AsObject = {
    totalLikes: number;
    liked: boolean;
  };
}

export class SitemapResponse extends jspb.Message {
  getXml(): string;
  setXml(value: string): SitemapResponse;

  getGeneratedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setGeneratedAt(value?: google_protobuf_timestamp_pb.Timestamp): SitemapResponse;
  hasGeneratedAt(): boolean;
  clearGeneratedAt(): SitemapResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SitemapResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SitemapResponse): SitemapResponse.AsObject;
  static serializeBinaryToWriter(message: SitemapResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SitemapResponse;
  static deserializeBinaryFromReader(message: SitemapResponse, reader: jspb.BinaryReader): SitemapResponse;
}

export namespace SitemapResponse {
  export type AsObject = {
    xml: string;
    generatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

