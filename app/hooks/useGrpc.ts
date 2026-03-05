import { useMemo } from 'react';
import { transport, getGrpcMetadata } from '~/utils/grpcClient';

/**
 * Hook to provide standardized gRPC transport and metadata
 */
export function useGrpc() {
  return useMemo(() => ({
    transport,
    options: {
      meta: getGrpcMetadata()
    }
  }), []);
}
