/**
 * Blog Service - gRPC-Web Client
 */

import { BlogServiceClient } from '~/grpc/generated/notifications/blog_grpc_web_pb';
import { GRPC_WEB_BASE_URL, handleGrpcError } from './client';
import {
  LikePostRequest,
  LikePostResponse,
  UnlikePostRequest,
  GetLikeStatusRequest,
  LikeStatusResponse,
  SubscribeToBlogRequest,
  SubscribeToBlogResponse,
  UnsubscribeFromBlogRequest,
  TrackViewRequest,
  TrackShareRequest,
  CreateCommentRequest,
  CommentResponse,
  ListCommentsRequest,
  ListCommentsResponse,
} from '~/grpc/generated/notifications/blog_pb';
import type { RpcError } from 'grpc-web';

class BlogService {
  private client: BlogServiceClient;

  constructor() {
    this.client = new BlogServiceClient(GRPC_WEB_BASE_URL, null, null);
  }

  async likePost(postId: string, userId: string): Promise<{ totalLikes: number; liked: boolean }> {
    const request = new LikePostRequest();
    request.setPostId(postId);
    request.setUserId(userId);

    return new Promise((resolve, reject) => {
      this.client.likePost(request, {}, (err: RpcError, response: LikePostResponse) => {
        if (err) {
          reject(handleGrpcError(err));
        } else if (response) {
          resolve({
            totalLikes: response.getTotalLikes(),
            liked: response.getLiked(),
          });
        } else {
          reject(new Error('No response received'));
        }
      });
    });
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const request = new UnlikePostRequest();
    request.setPostId(postId);
    request.setUserId(userId);

    return new Promise((resolve, reject) => {
      this.client.unlikePost(request, {}, (err: RpcError) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve();
        }
      });
    });
  }

  async getLikeStatus(postId: string, userId?: string): Promise<{ totalLikes: number; liked: boolean }> {
    const request = new GetLikeStatusRequest();
    request.setPostId(postId);
    if (userId) {
      request.setUserId(userId);
    }

    return new Promise((resolve, reject) => {
      this.client.getLikeStatus(request, {}, (err: RpcError, response: LikeStatusResponse) => {
        if (err) {
          reject(handleGrpcError(err));
        } else if (response) {
          resolve({
            totalLikes: response.getTotalLikes(),
            liked: response.getLiked(),
          });
        } else {
          reject(new Error('No response received'));
        }
      });
    });
  }
  async subscribeToBlog(email: string, name?: string): Promise<{ message: string; alreadySubscribed: boolean }> {
    const request = new SubscribeToBlogRequest();
    request.setEmail(email);
    if (name) request.setName(name);

    return new Promise((resolve, reject) => {
      this.client.subscribeToBlog(request, {}, (err: RpcError, response: SubscribeToBlogResponse) => {
        if (err) {
          reject(handleGrpcError(err));
        } else if (response) {
          resolve({
            message: response.getMessage(),
            alreadySubscribed: response.getAlreadySubscribed(),
          });
        } else {
          reject(new Error('No response received'));
        }
      });
    });
  }

  async unsubscribeFromBlog(token: string): Promise<void> {
    const request = new UnsubscribeFromBlogRequest();
    request.setToken(token);

    return new Promise((resolve, reject) => {
      this.client.unsubscribeFromBlog(request, {}, (err: RpcError) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve();
        }
      });
    });
  }

  async trackView(postId: string, sessionId: string, source: string, deviceType: string): Promise<void> {
    const request = new TrackViewRequest();
    request.setPostId(postId);
    request.setSessionId(sessionId);
    request.setSource(source);
    request.setDeviceType(deviceType);
    return new Promise((resolve, reject) => {
      this.client.trackView(request, {}, (err: RpcError) => {
        if (err) reject(handleGrpcError(err));
        else resolve();
      });
    });
  }

  async trackShare(postId: string, platform: string, sessionId: string): Promise<void> {
    const request = new TrackShareRequest();
    request.setPostId(postId);
    request.setPlatform(platform);
    request.setSessionId(sessionId);
    return new Promise((resolve, reject) => {
      this.client.trackShare(request, {}, (err: RpcError) => {
        if (err) reject(handleGrpcError(err));
        else resolve();
      });
    });
  }

  async createComment(postId: string, userName: string, content: string, userEmail?: string, userId?: string): Promise<void> {
    const request = new CreateCommentRequest();
    request.setPostId(postId);
    request.setUserName(userName);
    request.setContent(content);
    if (userEmail) request.setUserEmail(userEmail);
    if (userId) request.setUserId(userId);
    return new Promise<void>((resolve, reject) => {
      this.client.createComment(request, {}, (err: RpcError, _response: CommentResponse) => {
        if (err) reject(handleGrpcError(err));
        else resolve();
      });
    });
  }

  async listComments(postId: string, status = 'approved'): Promise<Array<{ id: string; post_id: string; user_id: string; user_name: string; content: string; status: string; created_at: string }>> {
    const request = new ListCommentsRequest();
    request.setPostId(postId);
    request.setStatus(status);
    return new Promise((resolve, reject) => {
      this.client.listComments(request, {}, (err: RpcError, response: ListCommentsResponse) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response.getCommentsList().map(c => ({
          id: c.getId(),
          post_id: c.getPostId(),
          user_id: c.getUserId(),
          user_name: c.getUserName(),
          content: c.getContent(),
          status: c.getStatus(),
          created_at: c.getCreatedAt()?.toDate().toISOString() ?? '',
        })));
      });
    });
  }
}

export const blogService = new BlogService();
