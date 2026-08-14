import * as authGrpcModule from '~/grpc/generated/auth/auth_grpc_web_pb';
import * as authPbModule from '~/grpc/generated/auth/auth_pb';
import * as structPb from 'google-protobuf/google/protobuf/struct_pb.js';
import { AUTH_API_BASE_URL } from '~/config/api';

type PWAEvent = 'install' | 'launch' | 'refresh';
const authGrpc = (authGrpcModule as any).default ?? authGrpcModule;
const authPb = (authPbModule as any).default ?? authPbModule;
const StructClass = (structPb as any).Struct ?? (structPb as any).default?.Struct;

function installationId(): string {
  const key = 'homebit:pwa-installation-id';
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, value);
  }
  return value;
}

export function isInstalledPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as any).standalone);
}

export function reportPWAEvent(event: PWAEvent): void {
  if (!isInstalledPWA() && event !== 'install') return;
  try {
    const request = new authPb.JsonPayload();
    request.setData(StructClass.fromJavaScript({
      installation_id: installationId(), app: 'website', event,
      platform: (navigator as any).userAgentData?.platform || navigator.platform || '',
      browser: navigator.userAgent.slice(0, 80),
    }));
    new authGrpc.AuthServiceClient(AUTH_API_BASE_URL).recordPWAUsage(request, {}, () => undefined);
  } catch { /* Telemetry must never interfere with the app. */ }
}
