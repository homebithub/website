import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
import { API_BASE_URL } from '~/config/api';
import { RpcMetadata } from '@protobuf-ts/runtime-rpc';

/**
 * Unified gRPC-Web client utility for Homebit using @protobuf-ts.
 * Handles authentication metadata and provides a clean interface for gRPC calls.
 */

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return API_BASE_URL;
  }
  return API_BASE_URL;
};

// Create the transport for gRPC-Web
export const transport = new GrpcWebFetchTransport({
  baseUrl: getBaseUrl(),
  format: 'binary',
});

/**
 * Get authentication metadata (JWT) for gRPC calls.
 */
export const getGrpcMetadata = (requireAuth: boolean = true): RpcMetadata => {
  const metadata: RpcMetadata = {};
  
  if (typeof window === 'undefined') return metadata;

  const token = localStorage.getItem('token');
  if (token) {
    metadata['authorization'] = `Bearer ${token}`;
  }

  const userObj = localStorage.getItem('user_object');
  if (userObj) {
    try {
      const user = JSON.parse(userObj);
      if (user.profile_id) metadata['x-profile-id'] = user.profile_id;
      if (user.profile_type) metadata['x-profile-type'] = user.profile_type;
    } catch (e) {
      // Ignore
    }
  }

  return metadata;
};

/**
 * Helper to handle gRPC errors uniformly.
 */
export const handleGrpcError = (error: any, requireAuth: boolean = true) => {
  console.error('[gRPC Client] Error:', error);
  
  // gRPC status codes: 16 = UNAUTHENTICATED
  if (error.code === 'UNAUTHENTICATED' || error.status === 16 || error.message?.toLowerCase().includes('unauthenticated')) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user_object');
      if (requireAuth) {
        const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?returnTo=${returnTo}`;
      }
    }
  }
  throw error;
};
