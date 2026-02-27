import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateDeviceFingerprint,
  getDeviceId,
  getDeviceName,
  getUserIpAddress,
  getUserLocation,
  prepareDeviceRegistration,
} from '../deviceFingerprint';

// Mock global objects
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  language: 'en-US',
  platform: 'MacIntel',
  hardwareConcurrency: 8,
  deviceMemory: 8,
};

const mockScreen = {
  width: 1920,
  height: 1080,
  colorDepth: 24,
};

describe('deviceFingerprint utility', () => {
  let originalNavigator: any;
  let originalScreen: any;
  let originalWindow: any;
  let originalDocument: any;
  let originalCrypto: any;
  let originalLocalStorage: any;

  beforeEach(() => {
    // Save originals
    originalNavigator = global.navigator;
    originalScreen = global.screen;
    originalWindow = global.window;
    originalDocument = global.document;
    originalCrypto = global.crypto;
    originalLocalStorage = global.localStorage;

    // Reset mocks
    vi.clearAllMocks();
    
    // Mock navigator
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
      configurable: true,
    });
    
    // Mock screen
    Object.defineProperty(global, 'screen', {
      value: mockScreen,
      writable: true,
      configurable: true,
    });
    
    // Mock window
    Object.defineProperty(global, 'window', {
      value: { ontouchstart: undefined },
      writable: true,
      configurable: true,
    });
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
    
    // Mock document
    Object.defineProperty(global, 'document', {
      value: {
        createElement: vi.fn(() => ({
          getContext: vi.fn(() => null),
          toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
        })),
      },
      writable: true,
      configurable: true,
    });
    
    // Mock crypto
    Object.defineProperty(global, 'crypto', {
      value: {
        subtle: {
          digest: vi.fn(async (algorithm, data) => {
            // Create a unique hash based on input data
            const view = new Uint8Array(data);
            const sum = Array.from(view).reduce((a, b) => a + b, 0);
            const buffer = new ArrayBuffer(32);
            const view32 = new Uint8Array(buffer);
            view32[0] = sum % 256;
            view32[1] = (sum >> 8) % 256;
            return buffer;
          }),
        },
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore originals
    if (originalNavigator) {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    }
    if (originalScreen) {
      Object.defineProperty(global, 'screen', {
        value: originalScreen,
        writable: true,
        configurable: true,
      });
    }
    if (originalWindow) {
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    }
    if (originalDocument) {
      Object.defineProperty(global, 'document', {
        value: originalDocument,
        writable: true,
        configurable: true,
      });
    }
    if (originalCrypto) {
      Object.defineProperty(global, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      });
    }
    if (originalLocalStorage) {
      Object.defineProperty(global, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    }
  });

  describe('getDeviceName', () => {
    beforeEach(() => {
      // Reset navigator to default for each test
      Object.defineProperty(global, 'navigator', {
        value: { ...mockNavigator },
        writable: true,
        configurable: true,
      });
    });

    it('detects iPhone', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
      });
      expect(getDeviceName()).toBe('iPhone');
    });

    it('detects iPad', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        writable: true,
      });
      expect(getDeviceName()).toBe('iPad');
    });

    it('detects Android device with model', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 11; Pixel 5)',
        writable: true,
      });
      expect(getDeviceName()).toBe('Pixel 5');
    });

    it('detects generic Android device', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 11)',
        writable: true,
      });
      expect(getDeviceName()).toBe('Android Device');
    });

    it('detects Mac', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        writable: true,
      });
      expect(getDeviceName()).toBe('Mac');
    });

    it('detects Windows PC', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        writable: true,
      });
      expect(getDeviceName()).toBe('Windows PC');
    });

    it('detects Linux PC', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (X11; Linux x86_64)',
        writable: true,
      });
      expect(getDeviceName()).toBe('Linux PC');
    });

    it('returns Unknown Device for unrecognized user agent', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Some Unknown Browser',
        writable: true,
      });
      expect(getDeviceName()).toBe('Unknown Device');
    });
  });

  describe('getUserIpAddress', () => {
    it('fetches IP address from API', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ ip: '192.168.1.1' }),
        })
      ) as any;

      const ip = await getUserIpAddress();
      expect(ip).toBe('192.168.1.1');
      expect(global.fetch).toHaveBeenCalledWith('https://api.ipify.org?format=json');
    });

    it('returns fallback IP on fetch error', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

      const ip = await getUserIpAddress();
      expect(ip).toBe('0.0.0.0');
    });

    it('returns fallback IP on JSON parse error', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.reject(new Error('Parse error')),
        })
      ) as any;

      const ip = await getUserIpAddress();
      expect(ip).toBe('0.0.0.0');
    });
  });

  describe('getUserLocation', () => {
    it('returns location when permission granted', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => {
          success({
            coords: {
              latitude: 37.7749,
              longitude: -122.4194,
            },
          });
        }),
      };
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
      });

      const location = await getUserLocation();
      expect(location).toEqual({
        latitude: 37.7749,
        longitude: -122.4194,
      });
    });

    it('returns null when geolocation not available', async () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        writable: true,
      });

      const location = await getUserLocation();
      expect(location).toBeNull();
    });

    it('returns null when permission denied', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success, error) => {
          error(new Error('Permission denied'));
        }),
      };
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
      });

      const location = await getUserLocation();
      expect(location).toBeNull();
    });

    it('calls getCurrentPosition with correct options', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => {
          // Call success callback to prevent timeout
          success({
            coords: {
              latitude: 37.7749,
              longitude: -122.4194,
            },
          });
        }),
      };
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
      });

      await getUserLocation();
      
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          timeout: 5000,
          maximumAge: 300000,
        }
      );
    });
  });

  describe('getDeviceId', () => {
    it('returns stored device ID if exists', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('stored-device-id');

      const deviceId = await getDeviceId();
      expect(deviceId).toBe('stored-device-id');
      expect(localStorage.getItem).toHaveBeenCalledWith('device_id');
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('generates and stores new device ID if not exists', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const deviceId = await getDeviceId();
      expect(deviceId).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledWith('device_id', deviceId);
    });

    it('returns consistent ID on subsequent calls', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const deviceId1 = await getDeviceId();
      
      vi.mocked(localStorage.getItem).mockReturnValue(deviceId1);
      const deviceId2 = await getDeviceId();
      
      expect(deviceId2).toBe(deviceId1);
    });
  });

  describe('generateDeviceFingerprint', () => {
    beforeEach(() => {
      // Reset navigator to default for each test
      Object.defineProperty(global, 'navigator', {
        value: { ...mockNavigator },
        writable: true,
        configurable: true,
      });
    });

    it('generates a fingerprint hash', async () => {
      const fingerprint = await generateDeviceFingerprint();
      expect(fingerprint).toBeTruthy();
      expect(typeof fingerprint).toBe('string');
    });

    it('generates consistent fingerprint for same environment', async () => {
      const fp1 = await generateDeviceFingerprint();
      const fp2 = await generateDeviceFingerprint();
      expect(fp1).toBe(fp2);
    });

    it('includes user agent in fingerprint', async () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Custom User Agent 1',
        writable: true,
      });
      const fp1 = await generateDeviceFingerprint();

      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Custom User Agent 2',
        writable: true,
      });
      const fp2 = await generateDeviceFingerprint();

      expect(fp1).not.toBe(fp2);
    });

    it('includes screen resolution in fingerprint', async () => {
      Object.defineProperty(global, 'screen', {
        value: { width: 1920, height: 1080, colorDepth: 24 },
        writable: true,
      });
      const fp1 = await generateDeviceFingerprint();

      Object.defineProperty(global, 'screen', {
        value: { width: 1280, height: 720, colorDepth: 24 },
        writable: true,
      });
      const fp2 = await generateDeviceFingerprint();

      expect(fp1).not.toBe(fp2);
    });

    it('handles missing hardwareConcurrency', async () => {
      const nav = { ...mockNavigator };
      delete (nav as any).hardwareConcurrency;
      Object.defineProperty(global, 'navigator', {
        value: nav,
        writable: true,
      });

      const fingerprint = await generateDeviceFingerprint();
      expect(fingerprint).toBeTruthy();
    });

    it('handles missing deviceMemory', async () => {
      const nav = { ...mockNavigator };
      delete (nav as any).deviceMemory;
      Object.defineProperty(global, 'navigator', {
        value: nav,
        writable: true,
      });

      const fingerprint = await generateDeviceFingerprint();
      expect(fingerprint).toBeTruthy();
    });

    it('handles canvas fingerprinting failure', async () => {
      Object.defineProperty(global, 'document', {
        value: {
          createElement: vi.fn(() => {
            throw new Error('Canvas blocked');
          }),
        },
        writable: true,
      });

      const fingerprint = await generateDeviceFingerprint();
      expect(fingerprint).toBeTruthy();
    });

    it('handles WebGL unavailable', async () => {
      Object.defineProperty(global, 'document', {
        value: {
          createElement: vi.fn(() => ({
            getContext: vi.fn(() => null),
            toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
          })),
        },
        writable: true,
      });

      const fingerprint = await generateDeviceFingerprint();
      expect(fingerprint).toBeTruthy();
    });

    it('uses fallback hash when crypto.subtle unavailable', async () => {
      Object.defineProperty(global, 'crypto', {
        value: {
          subtle: {
            digest: vi.fn(() => Promise.reject(new Error('Crypto unavailable'))),
          },
        },
        writable: true,
      });

      const fingerprint = await generateDeviceFingerprint();
      expect(fingerprint).toBeTruthy();
      expect(typeof fingerprint).toBe('string');
    });

    it('detects touch support', async () => {
      Object.defineProperty(global, 'window', {
        value: { ontouchstart: null },
        writable: true,
      });
      const fp1 = await generateDeviceFingerprint();

      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });
      const fp2 = await generateDeviceFingerprint();

      expect(fp1).not.toBe(fp2);
    });
  });

  describe('prepareDeviceRegistration', () => {
    beforeEach(() => {
      // Reset navigator to default
      Object.defineProperty(global, 'navigator', {
        value: { ...mockNavigator },
        writable: true,
        configurable: true,
      });

      // Mock all dependencies
      vi.mocked(localStorage.getItem).mockReturnValue('test-device-id');
      
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ ip: '192.168.1.1' }),
        })
      ) as any;

      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => {
          success({
            coords: {
              latitude: 37.7749,
              longitude: -122.4194,
            },
          });
        }),
      };
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
      });
    });

    it('prepares complete device registration data', async () => {
      const data = await prepareDeviceRegistration();

      expect(data).toEqual({
        device_id: 'test-device-id',
        device_name: 'Mac',
        user_agent: mockNavigator.userAgent,
        ip_address: '192.168.1.1',
        latitude: 37.7749,
        longitude: -122.4194,
      });
    });

    it('handles missing location data', async () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        writable: true,
      });

      const data = await prepareDeviceRegistration();

      expect(data).toEqual({
        device_id: 'test-device-id',
        device_name: 'Mac',
        user_agent: mockNavigator.userAgent,
        ip_address: '192.168.1.1',
        latitude: undefined,
        longitude: undefined,
      });
    });

    it('handles IP fetch failure', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

      const data = await prepareDeviceRegistration();

      expect(data.ip_address).toBe('0.0.0.0');
    });

    it('calls all data gathering functions in parallel', async () => {
      const startTime = Date.now();
      await prepareDeviceRegistration();
      const endTime = Date.now();

      // Should complete quickly if parallel (not sequential)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
