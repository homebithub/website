import * as grpcWeb from 'grpc-web';

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"
import * as notifications_blog_pb from '../notifications/blog_pb'; // proto import: "notifications/blog.proto"


export class BlogServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createPost(
    request: notifications_blog_pb.CreatePostRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.BlogPostResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.BlogPostResponse>;

  updatePost(
    request: notifications_blog_pb.UpdatePostRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.BlogPostResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.BlogPostResponse>;

  getPost(
    request: notifications_blog_pb.GetPostRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.BlogPostResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.BlogPostResponse>;

  getPostBySlug(
    request: notifications_blog_pb.GetPostBySlugRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.BlogPostResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.BlogPostResponse>;

  listPosts(
    request: notifications_blog_pb.ListPostsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.ListPostsResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.ListPostsResponse>;

  deletePost(
    request: notifications_blog_pb.DeletePostRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  publishPost(
    request: notifications_blog_pb.PublishPostRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.BlogPostResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.BlogPostResponse>;

  unpublishPost(
    request: notifications_blog_pb.UnpublishPostRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.BlogPostResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.BlogPostResponse>;

  trackView(
    request: notifications_blog_pb.TrackViewRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  trackShare(
    request: notifications_blog_pb.TrackShareRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  trackClick(
    request: notifications_blog_pb.TrackClickRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  getPostAnalytics(
    request: notifications_blog_pb.GetPostAnalyticsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.PostAnalyticsResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.PostAnalyticsResponse>;

  getAnalyticsSummary(
    request: notifications_blog_pb.GetAnalyticsSummaryRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.AnalyticsSummaryResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.AnalyticsSummaryResponse>;

  trackConversion(
    request: notifications_blog_pb.TrackConversionRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  getPostConversions(
    request: notifications_blog_pb.GetPostConversionsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.PostConversionsResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.PostConversionsResponse>;

  createComment(
    request: notifications_blog_pb.CreateCommentRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.CommentResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.CommentResponse>;

  listComments(
    request: notifications_blog_pb.ListCommentsRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.ListCommentsResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.ListCommentsResponse>;

  moderateComment(
    request: notifications_blog_pb.ModerateCommentRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.CommentResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.CommentResponse>;

  createCategory(
    request: notifications_blog_pb.CreateCategoryRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.CategoryResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.CategoryResponse>;

  listCategories(
    request: notifications_blog_pb.ListCategoriesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.ListCategoriesResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.ListCategoriesResponse>;

  likePost(
    request: notifications_blog_pb.LikePostRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.LikePostResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.LikePostResponse>;

  unlikePost(
    request: notifications_blog_pb.UnlikePostRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  getLikeStatus(
    request: notifications_blog_pb.GetLikeStatusRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.LikeStatusResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.LikeStatusResponse>;

  generateSitemap(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: notifications_blog_pb.SitemapResponse) => void
  ): grpcWeb.ClientReadableStream<notifications_blog_pb.SitemapResponse>;

  refreshStats(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

}

export class BlogServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  createPost(
    request: notifications_blog_pb.CreatePostRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.BlogPostResponse>;

  updatePost(
    request: notifications_blog_pb.UpdatePostRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.BlogPostResponse>;

  getPost(
    request: notifications_blog_pb.GetPostRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.BlogPostResponse>;

  getPostBySlug(
    request: notifications_blog_pb.GetPostBySlugRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.BlogPostResponse>;

  listPosts(
    request: notifications_blog_pb.ListPostsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.ListPostsResponse>;

  deletePost(
    request: notifications_blog_pb.DeletePostRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  publishPost(
    request: notifications_blog_pb.PublishPostRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.BlogPostResponse>;

  unpublishPost(
    request: notifications_blog_pb.UnpublishPostRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.BlogPostResponse>;

  trackView(
    request: notifications_blog_pb.TrackViewRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  trackShare(
    request: notifications_blog_pb.TrackShareRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  trackClick(
    request: notifications_blog_pb.TrackClickRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  getPostAnalytics(
    request: notifications_blog_pb.GetPostAnalyticsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.PostAnalyticsResponse>;

  getAnalyticsSummary(
    request: notifications_blog_pb.GetAnalyticsSummaryRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.AnalyticsSummaryResponse>;

  trackConversion(
    request: notifications_blog_pb.TrackConversionRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  getPostConversions(
    request: notifications_blog_pb.GetPostConversionsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.PostConversionsResponse>;

  createComment(
    request: notifications_blog_pb.CreateCommentRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.CommentResponse>;

  listComments(
    request: notifications_blog_pb.ListCommentsRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.ListCommentsResponse>;

  moderateComment(
    request: notifications_blog_pb.ModerateCommentRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.CommentResponse>;

  createCategory(
    request: notifications_blog_pb.CreateCategoryRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.CategoryResponse>;

  listCategories(
    request: notifications_blog_pb.ListCategoriesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.ListCategoriesResponse>;

  likePost(
    request: notifications_blog_pb.LikePostRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.LikePostResponse>;

  unlikePost(
    request: notifications_blog_pb.UnlikePostRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  getLikeStatus(
    request: notifications_blog_pb.GetLikeStatusRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.LikeStatusResponse>;

  generateSitemap(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<notifications_blog_pb.SitemapResponse>;

  refreshStats(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

}

