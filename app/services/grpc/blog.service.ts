/**
 * Blog Service - gRPC-Web Client
 */

import { GRPC_WEB_BASE_URL, handleGrpcError } from './client';
import type { RpcError } from 'grpc-web';

interface LoadedDeps {
  client: any;
  proto: any;
}

let loadedDepsPromise: Promise<LoadedDeps> | null = null;

async function loadDeps(): Promise<LoadedDeps> {
  if (!loadedDepsPromise) {
    loadedDepsPromise = Promise.all([
      import('~/grpc/generated/notifications/blog_grpc_web_pb'),
      import('~/grpc/generated/notifications/blog_pb'),
    ]).then(([grpcModule, protoModule]) => {
      const { BlogServiceClient } = grpcModule as any;
      const proto = (protoModule as any).default ?? protoModule;
      const client = new BlogServiceClient(GRPC_WEB_BASE_URL, null, null);
      return { client, proto };
    });
  }
  return loadedDepsPromise;
}

class BlogService {
  private async getDeps() {
    return loadDeps();
  }

  async likePost(postId: string, userId: string): Promise<{ totalLikes: number; liked: boolean }> {
    const { proto, client } = await this.getDeps();
    const request = new proto.LikePostRequest();
    request.setPostId(postId);
    request.setUserId(userId);

    return new Promise((resolve, reject) => {
      client.likePost(request, {}, (err: RpcError, response: any) => {
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
    const { proto, client } = await this.getDeps();
    const request = new proto.UnlikePostRequest();
    request.setPostId(postId);
    request.setUserId(userId);

    return new Promise((resolve, reject) => {
      client.unlikePost(request, {}, (err: RpcError) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve();
        }
      });
    });
  }

  async getLikeStatus(postId: string, userId?: string): Promise<{ totalLikes: number; liked: boolean }> {
    const { proto, client } = await this.getDeps();
    const request = new proto.GetLikeStatusRequest();
    request.setPostId(postId);
    if (userId) {
      request.setUserId(userId);
    }

    return new Promise((resolve, reject) => {
      client.getLikeStatus(request, {}, (err: RpcError, response: any) => {
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
    const { proto, client } = await this.getDeps();
    const request = new proto.SubscribeToBlogRequest();
    request.setEmail(email);
    if (name) request.setName(name);

    return new Promise((resolve, reject) => {
      client.subscribeToBlog(request, {}, (err: RpcError, response: any) => {
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
    const { proto, client } = await this.getDeps();
    const request = new proto.UnsubscribeFromBlogRequest();
    request.setToken(token);

    return new Promise((resolve, reject) => {
      client.unsubscribeFromBlog(request, {}, (err: RpcError) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve();
        }
      });
    });
  }

  async trackView(
    postId: string,
    sessionId: string,
    source: string,
    deviceType: string,
    userId?: string,
    utmSource?: string,
    utmMedium?: string,
    utmCampaign?: string,
  ): Promise<void> {
    const { proto, client } = await this.getDeps();
    const request = new proto.TrackViewRequest();
    request.setPostId(postId);
    request.setSessionId(sessionId);
    request.setSource(source);
    request.setDeviceType(deviceType);
    if (userId) request.setUserId(userId);
    if (utmSource) request.setUtmSource(utmSource);
    if (utmMedium) request.setUtmMedium(utmMedium);
    if (utmCampaign) request.setUtmCampaign(utmCampaign);
    return new Promise((resolve, reject) => {
      client.trackView(request, {}, (err: RpcError) => {
        if (err) reject(handleGrpcError(err));
        else resolve();
      });
    });
  }

  async trackShare(postId: string, platform: string, sessionId: string): Promise<void> {
    const { proto, client } = await this.getDeps();
    const request = new proto.TrackShareRequest();
    request.setPostId(postId);
    request.setPlatform(platform);
    request.setSessionId(sessionId);
    return new Promise((resolve, reject) => {
      client.trackShare(request, {}, (err: RpcError) => {
        if (err) reject(handleGrpcError(err));
        else resolve();
      });
    });
  }

  async createComment(postId: string, userName: string, content: string, userEmail?: string, userId?: string): Promise<void> {
    const { proto, client } = await this.getDeps();
    const request = new proto.CreateCommentRequest();
    request.setPostId(postId);
    request.setUserName(userName);
    request.setContent(content);
    if (userEmail) request.setUserEmail(userEmail);
    if (userId) request.setUserId(userId);
    return new Promise<void>((resolve, reject) => {
      client.createComment(request, {}, (err: RpcError) => {
        if (err) reject(handleGrpcError(err));
        else resolve();
      });
    });
  }

  async listComments(postId: string, status = 'approved'): Promise<Array<{ id: string; post_id: string; user_id: string; user_name: string; content: string; status: string; created_at: string }>> {
    const { proto, client } = await this.getDeps();
    const request = new proto.ListCommentsRequest();
    request.setPostId(postId);
    request.setStatus(status);
    return new Promise((resolve, reject) => {
      client.listComments(request, {}, (err: RpcError, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response.getCommentsList().map((c: any) => ({
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
