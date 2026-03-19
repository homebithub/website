import { useRef, useCallback } from 'react';
import { transport } from '~/utils/grpcClient';

/**
 * SSR-safe lazy gRPC client hook.
 *
 * gRPC-Web clients (from @protobuf-ts) cannot be instantiated during
 * server-side rendering because Vite's SSR module transform doesn't
 * resolve the generated service descriptors as constructors.
 *
 * This hook defers instantiation to the first client-side call,
 * which is safe because all gRPC usage happens inside useEffect
 * callbacks and event handlers (never during render).
 *
 * Usage:
 *   const getClient = useGrpcClient(AuthServiceClient);
 *   // inside useEffect / handler:
 *   const { response } = await getClient().someMethod(...);
 */
export function useGrpcClient<T>(
  ClientClass: new (transport: any) => T
): () => T {
  const ref = useRef<T | null>(null);
  return useCallback(() => {
    if (!ref.current) {
      ref.current = new ClientClass(transport);
    }
    return ref.current;
  }, []);
}
