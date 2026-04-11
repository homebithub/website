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
}

export const blogService = new BlogService();
