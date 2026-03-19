// NOTE: Proto files need to be regenerated from homebit-pkg v0.26.0
// Run: cd homebit-pkg/proto && make web
// Then copy generated files to website/app/grpc/generated/

import { ReviewServiceClient } from '~/grpc/generated/auth/auth_grpc_web_pb';
import * as auth_pb from '~/grpc/generated/auth/auth_pb';
import * as struct_pb from 'google-protobuf/google/protobuf/struct_pb.js';

const client = new ReviewServiceClient(
  import.meta.env.VITE_AUTH_API_BASE_URL || 'http://localhost:3005',
  null,
  null
);

export interface ReviewFormData {
  hiring_id: string;
  reviewee_id: string;
  rating: number;
  title: string;
  content: string;
  images: Array<{
    image_url: string;
    s3_key: string;
    caption?: string;
  }>;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  hiring_id?: string;
  rating: number;
  title: string;
  content: string;
  type: string;
  helpful_count: number;
  response?: string;
  response_at?: string;
  created_at: string;
  images?: Array<{
    image_url: string;
    caption?: string;
  }>;
  reviewer_profile?: {
    id: string;
    first_name: string;
    last_name: string;
    type: string;
    verified: boolean;
  };
}

export interface ReviewStats {
  reviewee_id: string;
  total_reviews: number;
  average_rating: number;
  rating_1_count: number;
  rating_2_count: number;
  rating_3_count: number;
  rating_4_count: number;
  rating_5_count: number;
}

export interface PaginatedReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Create a new review with optional images
 */
export async function createReview(
  userId: string,
  data: ReviewFormData
): Promise<Review> {
  const request = new auth_pb.CreateReviewReq();
  request.setUserId(userId);
  
  const reviewData = struct_pb.Struct.fromJavaScript({
    ...data,
    reviewer_id: userId,
  });
  request.setData(reviewData);

  return new Promise((resolve, reject) => {
    client.createReview(request, {}, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      
      const jsonStr = response?.getJson() || '{}';
      const review = JSON.parse(jsonStr);
      resolve(review);
    });
  });
}

/**
 * Get a single review by ID
 */
export async function getReview(
  reviewId: string,
  userId: string
): Promise<Review> {
  const request = new auth_pb.IdRequest();
  request.setId(reviewId);
  request.setUserId(userId);

  return new Promise((resolve, reject) => {
    client.getReview(request, {}, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      
      const jsonStr = response?.getJson() || '{}';
      const review = JSON.parse(jsonStr);
      resolve(review);
    });
  });
}

/**
 * Get public reviews for a profile with pagination
 */
export async function getPublicReviews(
  revieweeId: string,
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedReviewsResponse> {
  const request = new auth_pb.PaginatedRequest();
  request.setId(revieweeId);
  request.setUserId(userId);
  request.setPage(page);
  request.setLimit(limit);

  return new Promise((resolve, reject) => {
    client.getPublicReviews(request, {}, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      
      const jsonStr = response?.getJson() || '{}';
      const data = JSON.parse(jsonStr);
      resolve(data);
    });
  });
}

/**
 * Get reviews written by the current user
 */
export async function getMyReviews(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedReviewsResponse> {
  const request = new auth_pb.PaginatedRequest();
  request.setUserId(userId);
  request.setPage(page);
  request.setLimit(limit);

  return new Promise((resolve, reject) => {
    client.getMyReviews(request, {}, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      
      const jsonStr = response?.getJson() || '{}';
      const data = JSON.parse(jsonStr);
      resolve(data);
    });
  });
}

/**
 * Get review statistics for a profile
 */
export async function getReviewStats(
  revieweeId: string
): Promise<ReviewStats> {
  const request = new auth_pb.IdRequest();
  request.setId(revieweeId);

  return new Promise((resolve, reject) => {
    client.getReviewStats(request, {}, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      
      const jsonStr = response?.getJson() || '{}';
      const stats = JSON.parse(jsonStr);
      resolve(stats);
    });
  });
}

/**
 * Mark a review as helpful
 */
export async function markReviewHelpful(
  reviewId: string,
  userId: string
): Promise<void> {
  const request = new auth_pb.IdRequest();
  request.setId(reviewId);
  request.setUserId(userId);

  return new Promise((resolve, reject) => {
    client.markHelpful(request, {}, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * Remove helpful mark from a review
 */
export async function unmarkReviewHelpful(
  reviewId: string,
  userId: string
): Promise<void> {
  const request = new auth_pb.IdRequest();
  request.setId(reviewId);
  request.setUserId(userId);

  return new Promise((resolve, reject) => {
    client.unmarkHelpful(request, {}, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * Add a response to a review (reviewee only)
 */
export async function addReviewResponse(
  reviewId: string,
  userId: string,
  response: string
): Promise<void> {
  const request = new auth_pb.JsonPayload();
  request.setUserId(userId);
  
  const data = struct_pb.Struct.fromJavaScript({
    review_id: reviewId,
    response: response,
  });
  request.setData(data);

  return new Promise((resolve, reject) => {
    client.addResponse(request, {}, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export const reviewService = {
  createReview,
  getReview,
  getPublicReviews,
  getMyReviews,
  getReviewStats,
  markReviewHelpful,
  unmarkReviewHelpful,
  addReviewResponse,
};
